import React, { useState, useEffect } from 'react';
import { ChargingStation, ConnectorPort, UserWallet, PaymentReceipt } from '../types';
import {
  QrCode,
  Scan,
  Camera,
  X,
  Zap,
  CheckCircle2,
  Wallet,
  CreditCard,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Download,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  station?: ChargingStation | null;
  port?: ConnectorPort | null;
  userWallet: UserWallet;
  onTopUpWallet: (amount: number) => void;
  onAddPaymentReceipt?: (receipt: PaymentReceipt) => void;
  onStartSession?: (station: ChargingStation, port?: ConnectorPort) => void;
}

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  onClose,
  station,
  port,
  userWallet,
  onTopUpWallet,
  onAddPaymentReceipt,
  onStartSession,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('25');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi_evpay' | 'apple_pay' | 'card'>('upi_evpay');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scannedStationCode, setScannedStationCode] = useState<string>('EV-SF-01-PORT1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentSuccess(false);
      setIsProcessing(false);
      setScanSuccess(false);
      setIsScanning(true);
      if (station) {
        setScannedStationCode(`${station.id}-${port ? `PORT${port.portNumber}` : 'FAST'}`);
      }
    }
  }, [isOpen, station, port]);

  if (!isOpen) return null;

  const currentAmount = selectedAmount === -1 ? Math.max(1, Number(customAmount) || 0) : selectedAmount;

  // Simulate scanning charger QR label
  const handleSimulateScan = (code: string) => {
    setIsScanning(false);
    setScannedStationCode(code);
    setScanSuccess(true);
  };

  // Complete Payment Transaction
  const handleConfirmPay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      const receiptId = `RCP-QR-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReceipt: PaymentReceipt = {
        id: receiptId,
        sessionId: `SES-QR-${Math.floor(1000 + Math.random() * 9000)}`,
        stationName: station ? station.name : `EV Charger (${scannedStationCode})`,
        date: new Date().toISOString().slice(0, 10),
        kwhDelivered: Math.round((currentAmount / 0.38) * 10) / 10,
        durationMinutes: Math.round(currentAmount * 1.2),
        ratePerKwh: station ? Number((station.basePricePerKwh * station.surgePriceMultiplier).toFixed(2)) : 0.38,
        sessionFeeUsd: 1.50,
        taxUsd: Number((currentAmount * 0.08).toFixed(2)),
        totalUsd: currentAmount,
        paymentMethod: paymentMethod === 'wallet' ? 'EV-Wallet RFID' : paymentMethod === 'upi_evpay' ? 'QR UPI Instant' : paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Credit Card',
        vehicleModel: 'Tesla Model Y Dual Motor',
        carbonSavedKg: Number((currentAmount * 1.85).toFixed(1)),
      };

      setLastReceipt(newReceipt);

      // If user paid via top-up or wallet deduction
      if (paymentMethod === 'wallet') {
        // deduct from wallet if paying session, or top-up if adding
        if (currentAmount > userWallet.balanceUsd) {
          onTopUpWallet(currentAmount);
        }
      } else {
        // top up wallet or credit
        onTopUpWallet(currentAmount);
      }

      if (onAddPaymentReceipt) {
        onAddPaymentReceipt(newReceipt);
      }

      if (station && onStartSession) {
        onStartSession(station, port || undefined);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D12]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F141C] border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-6 font-mono">
        {/* Header */}
        <div className="bg-[#0A0D12] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                QR Instant In-App Payment
              </h2>
              <p className="text-[11px] text-slate-500">Scan charger post or pay directly with UPI / Wallet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#0F141C] text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-[#0A0D12] px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 rounded font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'scan'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Charger QR</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-1.5 rounded font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'generate'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show Payment QR</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {paymentSuccess ? (
            /* Successful Payment Receipt State */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Payment Confirmed
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  ${currentAmount.toFixed(2)} Charged Successfully
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Receipt ID: <span className="text-emerald-400 font-bold">{lastReceipt?.id}</span>
                </p>
              </div>

              {lastReceipt && (
                <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 text-left space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Station:</span>
                    <strong className="text-slate-200">{lastReceipt.stationName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Energy Estimate:</span>
                    <strong className="text-emerald-400">{lastReceipt.kwhDelivered} kWh</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <strong className="text-cyan-400">{lastReceipt.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5 font-bold">
                    <span>Total Paid:</span>
                    <span className="text-slate-100">${lastReceipt.totalUsd.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" /> Done & Return to App
              </button>
            </div>
          ) : activeTab === 'scan' ? (
            /* SCAN CHARGER QR CODE TAB */
            <div className="space-y-4">
              {/* Camera Scanner Simulation Viewport */}
              <div className="relative bg-[#070A0F] border border-slate-800 rounded-xl p-6 text-center overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                {/* Laser Scanning Animation overlay */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2 z-10 shadow-[0_0_15px_#10b981]" />

                {/* Simulated Camera Viewfinder frame */}
                <div className="relative w-40 h-40 border-2 border-dashed border-emerald-500/60 rounded-xl p-2 flex items-center justify-center bg-slate-950/60 shadow-2xl">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                  {/* SVG QR Code Illustration */}
                  <svg className="w-32 h-32 text-emerald-400 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM18 18h3v3h-3zM15 18h3v3h-3zM18 15h3v3h-3z" fill="currentColor" fillOpacity="0.2" />
                    <rect x="5" y="5" width="2" height="2" fill="currentColor" />
                    <rect x="17" y="5" width="2" height="2" fill="currentColor" />
                    <rect x="5" y="17" width="2" height="2" fill="currentColor" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Align QR code on charger post inside viewfinder
                </p>
              </div>

              {/* Preset Charger Posts to Simulate Scan */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Simulate Scanning Station QR Posts</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateScan('EV-SF-350KW-PORT1')}
                    className={`p-2 rounded border text-left font-mono transition-all ${
                      scannedStationCode === 'EV-SF-350KW-PORT1'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-[#0A0D12] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-200">SF Hub - Port #1</div>
                    <div className="text-[10px] text-slate-500">350 kW CCS • $0.38/kWh</div>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('EV-OAK-150KW-PORT2')}
                    className={`p-2 rounded border text-left font-mono transition-all ${
                      scannedStationCode === 'EV-OAK-150KW-PORT2'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-[#0A0D12] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-200">Oakland - Port #2</div>
                    <div className="text-[10px] text-slate-500">150 kW NACS • $0.34/kWh</div>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Select Charge Amount</label>
                  <span className="text-[11px] font-bold text-emerald-400">${currentAmount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                      }}
                      className={`py-2 rounded font-bold border transition-all ${
                        selectedAmount === amt
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                          : 'bg-[#0A0D12] text-slate-300 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('upi_evpay')}
                    className={`p-2 rounded border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'upi_evpay'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                        : 'bg-[#0A0D12] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px]">UPI / EV-Pay</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2 rounded border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'wallet'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-[#0A0D12] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px]">EV Wallet (${userWallet.balanceUsd.toFixed(0)})</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2 rounded border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-[#0A0D12] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px]">Apple/GPay</span>
                  </button>
                </div>
              </div>

              {/* Confirm QR Pay Button */}
              <button
                onClick={handleConfirmPay}
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" /> Pay ${currentAmount.toFixed(2)} via QR & Unlock Charger
                  </>
                )}
              </button>
            </div>
          ) : (
            /* GENERATE DISPLAY QR CODE FOR IN-APP PAYMENT / RECEIPT */
            <div className="space-y-4 text-center">
              <div className="bg-[#070A0F] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  Scan to Pay EV Wallet
                </span>

                {/* High Contrast Dynamic Vector QR Box */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-emerald-500/40 inline-block">
                  <svg className="w-44 h-44 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {/* Standard QR grid pattern */}
                    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3z" fill="currentColor" />
                    <rect x="5" y="5" width="2" height="2" fill="#ffffff" />
                    <rect x="17" y="5" width="2" height="2" fill="#ffffff" />
                    <rect x="5" y="17" width="2" height="2" fill="#ffffff" />
                    <path d="M10 3h1v4h-1zM12 3h1v2h-1zM10 9h4v1h-4zM15 10h2v1h-2zM18 9h3v1h-3zM10 12h2v2h-2zM13 13h2v1h-2zM17 12h2v3h-2zM3 10h2v1H3zM7 10h1v4H7zM3 13h3v1H3zM10 15h1v4h-1zM12 17h3v1h-3zM12 19h2v2h-2zM15 15h4v1h-4zM19 18h2v3h-2z" fill="currentColor" />
                  </svg>
                </div>

                <div className="font-mono text-xs">
                  <p className="font-bold text-slate-200">evcharge://pay/wallet?rfid={userWallet.rfidTagNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Point phone or scanner at station terminal to authorize charging</p>
                </div>
              </div>

              {/* Quick Top-Up or Auto-Pay Controls */}
              <div className="bg-[#0A0D12] p-3 rounded-lg border border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Connected Wallet RFID:</span>
                  <strong className="text-emerald-400 font-bold">{userWallet.rfidTagNumber}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Available Wallet Balance:</span>
                  <strong className="text-slate-100 font-bold">${userWallet.balanceUsd.toFixed(2)}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  onTopUpWallet(25);
                  handleConfirmPay();
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Simulate RFID QR Terminal Touch & Pay $25
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
