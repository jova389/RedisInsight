import { Exchange, parseMDAuctionIndicatorPb, parseMDOHLCVPb, parseMDSymbolDataPb, parseMDTradePb, parseMDTradingStatusPb, parseMDOBLevelUpdatePb, Side, TradingStatus } from "@makmurdevs/mdparserlib"

export const bufferFormatRangeItems = (
  items: any[],
  startIndex: number,
  lastIndex: number,
  formatItem: (item: any) => any,
): any[] => {
  const newItems = []
  if (lastIndex >= startIndex) {
    for (let index = startIndex; index <= lastIndex; index++) {
      if (!items[index]) return newItems
      newItems.push(formatItem(items[index]))
    }
  }

  return newItems
}

const enum StreamType {
  LiveOHLCV = "LiveOHLCV",
  OHLCV = "OHLCV",
  TradingStatus = "TradingStatus",
  AuctionIndicator = "AuctionIndicator",
  Trade = "Trade",
  SymbolData = "SymbolData",
  OBLevelUpdate = "OBLevelUpdate",
}

const needLibKey = new Map([
  [StreamType.LiveOHLCV, /^\{LiveOHLCV\}:(.+):(\d+)$/],
  [StreamType.OHLCV, /^\{OHLCV\}:(.+):(\d+)$/],
  [StreamType.TradingStatus, /^\{TradingStatus\}:(.+)$/],
  [StreamType.AuctionIndicator, /^\{AuctionIndicator\}:(.+)$/],
  [StreamType.Trade, /^\{Trade\}:(.+)$/],
  [StreamType.SymbolData, /^\{SymbolData\}:(.+)$/],
  [StreamType.OBLevelUpdate, /^\{OBLevelUpdate\}:(.+)$/],
])

const keyToParser = {
  [StreamType.LiveOHLCV]: parseMDOHLCVPb,
  [StreamType.OHLCV]: parseMDOHLCVPb,
  [StreamType.TradingStatus]: parseMDTradingStatusPb,
  [StreamType.AuctionIndicator]: parseMDAuctionIndicatorPb,
  [StreamType.Trade]: parseMDTradePb,
  [StreamType.SymbolData]: parseMDSymbolDataPb,
  [StreamType.OBLevelUpdate]: parseMDOBLevelUpdatePb,
}

const secondToHours = (secSinceMidnight: number): string => {
  const now = new Date()
  now.setHours(
      Math.floor(secSinceMidnight / 3600),
      Math.floor((secSinceMidnight % 3600) / 60),
      secSinceMidnight % 60,
      0,
    )
  return now.toLocaleString()
}

export const normalizeEnum = (parsed: any): string => {
  if (parsed.hasOwnProperty("tradingStatus")) {
    parsed.tradingStatus = TradingStatus[parsed.tradingStatus]
  }
  if (parsed.hasOwnProperty("side")) {
    parsed.side = Side[parsed.side]
  }
  if (parsed.hasOwnProperty("exchange")) {
    parsed.exchange = Exchange[parsed.exchange]
  }
  if (parsed.hasOwnProperty("receiveTime")) {
    parsed.receiveTime = secondToHours(parsed.receiveTime.secSinceMidnight)
  }
  if (parsed.hasOwnProperty("sendTime")) {
    parsed.sendTime = secondToHours(parsed.sendTime.secSinceMidnight)
  }
  return JSON.stringify(parsed)
}

export const shouldParseWithLib = (key: string) => {
  const entries = Array.from(needLibKey.entries())
  let matchCondition = false
  let matchType = StreamType.LiveOHLCV
  for (let i = 0; i < entries.length; i++) {
    const element = entries[i]
    if (element[1].test(key)) {
      matchCondition = true
      matchType = element[0]
    }
  }
  if (matchCondition) {
    return keyToParser[matchType]
  }
  return null
}