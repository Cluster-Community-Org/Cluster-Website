/**
 * Zero-dependency QR Code Matrix Generator
 * Based on Kazuhiko Arase's QR Code generator (MIT/BSD).
 * Generates ISO/IEC 18004 compliant QR code bit matrices (Versions 1-40, Levels L, M, Q, H).
 */

const PAD0 = 0xec
const PAD1 = 0x11

const QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3,
}

export const QRErrorCorrectionLevel = {
  L: 1, // ~7% recovery
  M: 0, // ~15% recovery
  Q: 3, // ~25% recovery
  H: 2, // ~30% recovery (Recommended for artistic / logo QRs)
}

const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
}

const QRMath = {
  glog(n) {
    if (n < 1) throw new Error(`glog(${n})`)
    return QRMath.LOG_TABLE[n]
  },
  gexp(n) {
    while (n < 0) n += 255
    while (n >= 256) n -= 255
    return QRMath.EXP_TABLE[n]
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256),
}

for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i
for (let i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] =
    QRMath.EXP_TABLE[i - 4] ^
    QRMath.EXP_TABLE[i - 5] ^
    QRMath.EXP_TABLE[i - 6] ^
    QRMath.EXP_TABLE[i - 8]
}
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i

function QRPolynomial(num, shift) {
  if (num.length === undefined) throw new Error(`${num.length}/${shift}`)
  let offset = 0
  while (offset < num.length && num[offset] === 0) offset++
  this.num = new Array(num.length - offset + shift)
  for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset]
}

QRPolynomial.prototype = {
  get(index) {
    return this.num[index]
  },
  getLength() {
    return this.num.length
  },
  multiply(e) {
    const num = new Array(this.getLength() + e.getLength() - 1)
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)))
      }
    }
    return new QRPolynomial(num, 0)
  },
  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0))
    const num = new Array(this.getLength())
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i)
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio)
    }
    return new QRPolynomial(num, 0).mod(e)
  },
}

function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount
  this.dataCount = dataCount
}

QRRSBlock.RS_BLOCK_TABLE = [
  // 1
  [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
  // 2
  [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
  // 3
  [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
  // 4
  [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
  // 5
  [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
  // 6
  [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  // 7
  [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
  // 8
  [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
  // 9
  [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
  // 10
  [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
]

QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectionLevel) {
  const rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectionLevel)
  if (rsBlock === undefined) {
    throw new Error(`bad rs block @ typeNumber:${typeNumber}/errorCorrectionLevel:${errorCorrectionLevel}`)
  }
  const length = rsBlock.length / 3
  const list = []
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3 + 0]
    const totalCount = rsBlock[i * 3 + 1]
    const dataCount = rsBlock[i * 3 + 2]
    for (let j = 0; j < count; j++) {
      list.push(new QRRSBlock(totalCount, dataCount))
    }
  }
  return list
}

QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
  switch (errorCorrectionLevel) {
    case QRErrorCorrectionLevel.L:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0]
    case QRErrorCorrectionLevel.M:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1]
    case QRErrorCorrectionLevel.Q:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2]
    case QRErrorCorrectionLevel.H:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3]
    default:
      return undefined
  }
}

function QRBitBuffer() {
  this.buffer = []
  this.length = 0
}

QRBitBuffer.prototype = {
  get(index) {
    const bufIndex = Math.floor(index / 8)
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1
  },
  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1)
    }
  },
  getLengthInBits() {
    return this.length
  },
  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8)
    if (this.buffer.length <= bufIndex) this.buffer.push(0)
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8)
    this.length++
  },
}

function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE
  this.data = data
  this.parsedData = []
  for (let i = 0, l = this.data.length; i < l; i++) {
    const byteArray = []
    const code = this.data.charCodeAt(i)
    if (code > 0x10000) {
      byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18)
      byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12)
      byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6)
      byteArray[3] = 0x80 | (code & 0x3f)
    } else if (code > 0x800) {
      byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12)
      byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6)
      byteArray[2] = 0x80 | (code & 0x3f)
    } else if (code > 0x80) {
      byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6)
      byteArray[1] = 0x80 | (code & 0x3f)
    } else {
      byteArray[0] = code
    }
    this.parsedData.push(byteArray)
  }
  this.parsedData = Array.prototype.concat.apply([], this.parsedData)
  if (this.parsedData.length !== this.data.length) {
    this.parsedData.unshift(191)
    this.parsedData.unshift(187)
    this.parsedData.unshift(239)
  }
}

QR8bitByte.prototype = {
  getLength() {
    return this.parsedData.length
  },
  write(buffer) {
    for (let i = 0, l = this.parsedData.length; i < l; i++) {
      buffer.put(this.parsedData[i], 8)
    }
  },
}

const QRUtil = {
  PATTERN_POSITION_TABLE: [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
  getBCHTypeInfo(data) {
    let d = data << 10
    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      d ^= QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15))
    }
    return ((data << 10) | d) ^ QRUtil.G15_MASK
  },
  getBCHDigit(data) {
    let digit = 0
    while (data !== 0) {
      digit++
      data >>>= 1
    }
    return digit
  },
  getPatternPosition(typeNumber) {
    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1]
  },
  getMask(maskPattern, i, j) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (i + j) % 2 === 0
      case QRMaskPattern.PATTERN001:
        return i % 2 === 0
      case QRMaskPattern.PATTERN010:
        return j % 3 === 0
      case QRMaskPattern.PATTERN011:
        return (i + j) % 3 === 0
      case QRMaskPattern.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
      case QRMaskPattern.PATTERN101:
        return ((i * j) % 2) + ((i * j) % 3) === 0
      case QRMaskPattern.PATTERN110:
        return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0
      case QRMaskPattern.PATTERN111:
        return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0
      default:
        throw new Error(`bad maskPattern:${maskPattern}`)
    }
  },
  getErrorFactoryPolynomial(errorCorrectionLength) {
    let a = new QRPolynomial([1], 0)
    for (let i = 0; i < errorCorrectionLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0))
    }
    return a
  },
  getLengthInBits(mode, type) {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRMode.MODE_8BIT_BYTE:
          return 8
        default:
          return 8
      }
    }
    return 16
  },
  getLostPoint(qrCode) {
    const moduleCount = qrCode.getModuleCount()
    let lostPoint = 0
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0
        const dark = qrCode.isDark(row, col)
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue
            if (r === 0 && c === 0) continue
            if (dark === qrCode.isDark(row + r, col + c)) sameCount++
          }
        }
        if (sameCount > 5) lostPoint += 3 + sameCount - 5
      }
    }
    return lostPoint
  },
}

function QRCodeModel(typeNumber, errorCorrectionLevel) {
  this.typeNumber = typeNumber
  this.errorCorrectionLevel = errorCorrectionLevel
  this.modules = null
  this.moduleCount = 0
  this.dataList = []
}

QRCodeModel.prototype = {
  addData(data) {
    const newData = new QR8bitByte(data)
    this.dataList.push(newData)
  },
  isDark(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(`${row},${col}`)
    }
    return this.modules[row][col]
  },
  getModuleCount() {
    return this.moduleCount
  },
  make() {
    if (this.typeNumber < 1) {
      let typeNumber = 1
      for (typeNumber = 1; typeNumber < 10; typeNumber++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectionLevel)
        const buffer = new QRBitBuffer()
        let totalDataCount = 0
        for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount
        for (let i = 0; i < this.dataList.length; i++) {
          const data = this.dataList[i]
          buffer.put(data.mode, 4)
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber))
          data.write(buffer)
        }
        if (buffer.getLengthInBits() <= totalDataCount * 8) break
      }
      this.typeNumber = typeNumber
    }
    this.makeImpl(false, this.getBestMaskPattern())
  },
  makeImpl(test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17
    this.modules = new Array(this.moduleCount)
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount)
      for (let col = 0; col < this.moduleCount; col++) this.modules[row][col] = null
    }
    this.setupPositionProbePattern(0, 0)
    this.setupPositionProbePattern(this.moduleCount - 7, 0)
    this.setupPositionProbePattern(0, this.moduleCount - 7)
    this.setupPositionAdjustPattern()
    this.setupTimingPattern()
    this.setupTypeInfo(test, maskPattern)
    this.mapData(this.createData(this.typeNumber, this.errorCorrectionLevel, this.dataList), maskPattern)
  },
  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true
        } else {
          this.modules[row + r][col + c] = false
        }
      }
    }
  },
  getBestMaskPattern() {
    let minLostPoint = 0
    let pattern = 0
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i)
      const lostPoint = QRUtil.getLostPoint(this)
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint
        pattern = i
      }
    }
    return pattern
  },
  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue
      this.modules[r][6] = r % 2 === 0
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue
      this.modules[6][c] = c % 2 === 0
    }
  },
  setupPositionAdjustPattern() {
    const pos = QRUtil.getPatternPosition(this.typeNumber)
    if (!pos) return
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i]
        const col = pos[j]
        if (this.modules[row][col] !== null) continue
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true
            } else {
              this.modules[row + r][col + c] = false
            }
          }
        }
      }
    }
  },
  setupTypeInfo(test, maskPattern) {
    const data = (this.errorCorrectionLevel << 3) | maskPattern
    const bits = QRUtil.getBCHTypeInfo(data)
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1
      if (i < 6) this.modules[i][8] = mod
      else if (i < 8) this.modules[i + 1][8] = mod
      else this.modules[this.moduleCount - 15 + i][8] = mod
    }
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1
      if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod
      else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod
      else this.modules[8][15 - i - 1] = mod
    }
    this.modules[this.moduleCount - 8][8] = !test
  },
  mapData(data, maskPattern) {
    let inc = -1
    let row = this.moduleCount - 1
    let bitIndex = 7
    let byteIndex = 0
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1
            }
            const mask = QRUtil.getMask(maskPattern, row, col - c)
            if (mask) dark = !dark
            this.modules[row][col - c] = dark
            bitIndex--
            if (bitIndex === -1) {
              byteIndex++
              bitIndex = 7
            }
          }
        }
        row += inc
        if (row < 0 || this.moduleCount <= row) {
          row -= inc
          inc = -inc
          break
        }
      }
    }
  },
  createData(typeNumber, errorCorrectionLevel, dataList) {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel)
    const buffer = new QRBitBuffer()
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i]
      buffer.put(data.mode, 4)
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber))
      data.write(buffer)
    }
    let totalDataCount = 0
    for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(`code length overflow. (${buffer.getLengthInBits()}>${totalDataCount * 8})`)
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4)
    while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(false)
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break
      buffer.put(PAD0, 8)
      if (buffer.getLengthInBits() >= totalDataCount * 8) break
      buffer.put(PAD1, 8)
    }
    return this.createBytes(buffer, rsBlocks)
  },
  createBytes(buffer, rsBlocks) {
    let offset = 0
    let maxDcCount = 0
    let maxEcCount = 0
    const dcdata = new Array(rsBlocks.length)
    const ecdata = new Array(rsBlocks.length)
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount
      const ecCount = rsBlocks[r].totalCount - dcCount
      maxDcCount = Math.max(maxDcCount, dcCount)
      maxEcCount = Math.max(maxEcCount, ecCount)
      dcdata[r] = new Array(dcCount)
      for (let i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset]
      offset += dcCount
      const rsPoly = QRUtil.getErrorFactoryPolynomial(ecCount)
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1)
      const modPoly = rawPoly.mod(rsPoly)
      ecdata[r] = new Array(rsPoly.getLength() - 1)
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0
      }
    }
    let totalCodeCount = 0
    for (let i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount
    const data = new Array(totalCodeCount)
    let index = 0
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i]
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i]
      }
    }
    return data
  },
}

/**
 * High-level helper: Generates a 2D boolean matrix for any text or link.
 * @param {string} text - The URL or string to encode
 * @param {string} errorCorrectionLevel - 'L' | 'M' | 'Q' | 'H' (Default: 'H')
 * @returns {{ size: number, isDark: (r: number, c: number) => boolean, isFinder: (r: number, c: number) => boolean, matrix: boolean[][] }}
 */
export function generateQRMatrix(text, errorCorrectionLevel = 'H') {
  const ec = QRErrorCorrectionLevel[errorCorrectionLevel] ?? QRErrorCorrectionLevel.H
  const qr = new QRCodeModel(0, ec)
  qr.addData(text)
  qr.make()

  const size = qr.getModuleCount()
  const matrix = []
  for (let r = 0; r < size; r++) {
    const row = []
    for (let c = 0; c < size; c++) {
      row.push(qr.isDark(r, c))
    }
    matrix.push(row)
  }

  // Returns true if within the 8x8 corner regions containing finder patterns
  const isFinder = (r, c) => {
    if (r < 8 && c < 8) return true // Top-Left
    if (r < 8 && c >= size - 8) return true // Top-Right
    if (r >= size - 8 && c < 8) return true // Bottom-Left
    return false
  }

  // Returns true if module belongs to the timing patterns (row 6 or column 6)
  const isTiming = (r, c) => {
    return (r === 6 || c === 6) && !isFinder(r, c)
  }

  // Returns true if module belongs to an alignment pattern (5x5 square)
  const isAlignment = (r, c) => {
    const pos = QRUtil.getPatternPosition(qr.typeNumber)
    if (!pos) return false
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i]
        const col = pos[j]
        if (
          (row < 8 && col < 8) ||
          (row < 8 && col >= size - 8) ||
          (row >= size - 8 && col < 8)
        ) {
          continue
        }
        if (Math.abs(r - row) <= 2 && Math.abs(c - col) <= 2) return true
      }
    }
    return false
  }

  return {
    size,
    isDark: (r, c) => qr.isDark(r, c),
    isFinder,
    isTiming,
    isAlignment,
    isFunctional: (r, c) => isFinder(r, c) || isTiming(r, c) || isAlignment(r, c),
    matrix,
  }
}

