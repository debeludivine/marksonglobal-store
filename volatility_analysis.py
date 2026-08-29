import MetaTrader5 as mt5
import pandas as pd
import numpy as np

if not mt5.initialize():
    print("Failed to initialize MT5")
    quit()

symbol = "EURUSD"
timeframe = mt5.TIMEFRAME_M1
rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, 1000)
mt5.shutdown()

if rates is None or len(rates) == 0:
    print("No rates returned")
    quit()

df = pd.DataFrame(rates)
df['time'] = pd.to_datetime(df['time'], unit='s')

# Calculate Metrics
df['pip_factor'] = 10000.0  # 1 pip = 0.0001
df['hl_range_pips'] = (df['high'] - df['low']) * df['pip_factor']
df['body_pips'] = (df['close'] - df['open']).abs() * df['pip_factor']
df['returns'] = df['close'].pct_change()
df['log_returns'] = np.log(df['close'] / df['close'].shift(1))

# True Range
prev_close = df['close'].shift(1)
tr1 = df['high'] - df['low']
tr2 = (df['high'] - prev_close).abs()
tr3 = (df['low'] - prev_close).abs()
df['true_range_pips'] = np.maximum.reduce([tr1, tr2, tr3]) * df['pip_factor']

# Parkinson Volatility estimator (High-Low based)
parkinson_var = (np.log(df['high'] / df['low']) ** 2).mean() / (4 * np.log(2))
parkinson_vol_annual = np.sqrt(parkinson_var * 1440 * 252) * 100

# Garman-Klass Volatility
gk = 0.5 * (np.log(df['high'] / df['low']) ** 2) - (2 * np.log(2) - 1) * (np.log(df['close'] / df['open']) ** 2)
gk_vol_annual = np.sqrt(gk.mean() * 1440 * 252) * 100

# Standard Deviation (Close-to-Close Annualized)
std_ret = df['log_returns'].std()
annual_vol = std_ret * np.sqrt(1440 * 252) * 100

# Output results
start_t = df['time'].iloc[0].strftime('%Y-%m-%d %H:%M')
end_t = df['time'].iloc[-1].strftime('%Y-%m-%d %H:%M')
start_p = df['open'].iloc[0]
end_p = df['close'].iloc[-1]
net_pips = (end_p - start_p) * 10000.0
net_pct = ((end_p / start_p) - 1) * 100

print(f"SYMBOL: {symbol}")
print(f"CANDLES: {len(df)} M1 bars")
print(f"TIME_SPAN: {start_t} -> {end_t} UTC (~{len(df)/60:.1f} trading hours)")
print(f"START_PRICE: {start_p:.5f}")
print(f"END_PRICE: {end_p:.5f}")
print(f"NET_CHANGE: {net_pips:+.1f} pips ({net_pct:+.2f}%)")
print(f"HIGHEST_PRICE: {df['high'].max():.5f}")
print(f"LOWEST_PRICE: {df['low'].min():.5f}")
print(f"TOTAL_SESSION_RANGE: {(df['high'].max() - df['low'].min()) * 10000:.1f} pips")

print("\n--- CANDLE VOLATILITY (PIPS) ---")
print(f"MEAN_CANDLE_RANGE: {df['hl_range_pips'].mean():.2f} pips")
print(f"MEDIAN_CANDLE_RANGE: {df['hl_range_pips'].median():.2f} pips")
print(f"ATR_14: {df['true_range_pips'].rolling(14).mean().iloc[-1]:.2f} pips")
print(f"MAX_1M_SPIKE: {df['hl_range_pips'].max():.2f} pips")
print(f"P90_CANDLE_RANGE: {df['hl_range_pips'].quantile(0.90):.2f} pips")
print(f"P99_CANDLE_RANGE: {df['hl_range_pips'].quantile(0.99):.2f} pips")
print(f"MEAN_CANDLE_BODY: {df['body_pips'].mean():.2f} pips")

print("\n--- ANNUALIZED VOLATILITY ESTIMATORS ---")
print(f"CLOSE_TO_CLOSE_VOL: {annual_vol:.2f}%")
print(f"PARKINSON_VOL: {parkinson_vol_annual:.2f}%")
print(f"GARMAN_KLASS_VOL: {gk_vol_annual:.2f}%")

print("\n--- RECENT 5 CANDLES ---")
for _, r in df.tail(5).iterrows():
    print(f"{r['time']} | O:{r['open']:.5f} H:{r['high']:.5f} L:{r['low']:.5f} C:{r['close']:.5f} | Range:{r['hl_range_pips']:.1f}p | Vol:{r['tick_volume']}")
