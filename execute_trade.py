import MetaTrader5 as mt5

if not mt5.initialize():
    print("Failed to initialize MT5")
    quit()

symbol = "EURUSD"
lot = 0.10
sym_info = mt5.symbol_info(symbol)
if sym_info is None:
    print(f"Symbol {symbol} not found")
    quit()

point = sym_info.point
tick = mt5.symbol_info_tick(symbol)
price = tick.bid

sl_pips = 4.0
tp_pips = 8.0
sl = round(price + (sl_pips * 10 * point), 5)
tp = round(price - (tp_pips * 10 * point), 5)

# Determine the correct filling mode
# SYMBOL_FILLING_FOK = 1 -> ORDER_FILLING_FOK (0)
# SYMBOL_FILLING_IOC = 2 -> ORDER_FILLING_IOC (1)
if sym_info.filling_mode & 1:
    filling = mt5.ORDER_FILLING_FOK
elif sym_info.filling_mode & 2:
    filling = mt5.ORDER_FILLING_IOC
else:
    filling = mt5.ORDER_FILLING_RETURN

request = {
    "action": mt5.TRADE_ACTION_DEAL,
    "symbol": symbol,
    "volume": lot,
    "type": mt5.ORDER_TYPE_SELL,
    "price": price,
    "sl": sl,
    "tp": tp,
    "deviation": 20,
    "magic": 234000,
    "comment": "AI Volatility Strategy Sell",
    "type_time": mt5.ORDER_TIME_GTC,
    "type_filling": filling,
}

res = mt5.order_send(request)
print(f"Retcode: {res.retcode if res else 'None'}")
print(f"Comment: {res.comment if res else mt5.last_error()}")
if res and res.order:
    print(f"Order Ticket: {res.order}")
    print(f"Filled Volume: {res.volume}")
    print(f"Execution Price: {res.price}")

positions = mt5.positions_get(symbol=symbol)
print(f"\n--- ACTIVE OPEN POSITIONS ({len(positions) if positions else 0}) ---")
if positions:
    for p in positions:
        side = "SELL" if p.type == 1 else "BUY"
        print(f"Ticket #{p.ticket} | {side} {p.volume} {p.symbol} @ {p.price_open:.5f} | SL: {p.sl:.5f} | TP: {p.tp:.5f} | Current PnL: ${p.profit:+.2f}")

mt5.shutdown()
