import { parseMDAuctionIndicatorPb, parseMDOHLCVPb, parseMDTradePb, parseMDTradingStatusPb } from "@makmurdevs/mdparserlib"

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
}

const needLibKey = new Map([
  [StreamType.LiveOHLCV, /^\{LiveOHLCV\}:(.+):(\d+)$/],
  [StreamType.OHLCV, /^\{OHLCV\}:(.+):(\d+)$/],
  [StreamType.TradingStatus, /^\{TradingStatus\}:(.+)$/],
  [StreamType.AuctionIndicator, /^\{AuctionIndicator\}:(.+)$/],
  [StreamType.Trade, /^\{Trade\}:(.+)$/],
])

const keyToParser = {
  [StreamType.LiveOHLCV]: parseMDOHLCVPb,
  [StreamType.OHLCV]: parseMDOHLCVPb,
  [StreamType.TradingStatus]: parseMDTradingStatusPb,
  [StreamType.AuctionIndicator]: parseMDAuctionIndicatorPb,
  [StreamType.Trade]: parseMDTradePb,
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