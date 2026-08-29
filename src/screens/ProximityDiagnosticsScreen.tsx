import React, { useState, useEffect } from 'react';
import {
  ProximityDiagnostics,
  NearbyDevice,
} from '../types';
import { defaultProximityEngine, isNativePlatform } from '../services/proximity';
import {
  Bluetooth,
  Activity,
  ArrowLeft,
  Signal,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface ProximityDiagnosticsScreenProps {
  onBack: () => void;
}

export const ProximityDiagnosticsScreen: React.FC<ProximityDiagnosticsScreenProps> = ({
  onBack,
}) => {
  const [diagnostics, setDiagnostics] = useState<ProximityDiagnostics>(() =>
    defaultProximityEngine.getDiagnosticsSnapshot()
  );
  const [requestingPerms, setRequestingPerms] = useState(false);

  useEffect(() => {
    const unsub = defaultProximityEngine.subscribeDiagnostics((diag) => {
      setDiagnostics(diag);
    });
    return () => unsub();
  }, []);

  const handleRequestPerms = async () => {
    setRequestingPerms(true);
    try {
      await defaultProximityEngine.requestPermissions();
    } finally {
      setRequestingPerms(false);
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const secondsAgo = Math.round((Date.now() - timestamp) / 1000);
    if (secondsAgo < 5) return 'Just now (< 5s)';
    return `${secondsAgo}s ago (${new Date(timestamp).toLocaleTimeString()})`;
  };

  return (
    <div className="min-h-screen bg-[#1C1917] text-[#FAFAF9] max-w-md mx-auto p-4 space-y-4 pb-20 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between bg-linear-to-b from-[#292524] to-[#1F1C1A] border border-[#44403C] p-3.5 rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-[#A8A29E] hover:bg-[#3B3633] hover:text-[#FAFAF9] rounded-lg cursor-pointer transition active:translate-y-[0.5px]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs font-semibold text-[#EEF2FF] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#2DD4BF] animate-pulse" />
              BLE Proximity Diagnostics
            </h2>
            <p className="text-[10px] text-[#A8A29E]">Internal Engine & Hardware Telemetry</p>
          </div>
        </div>

        <span className="px-2 py-0.5 bg-[#3730A3]/60 border border-[#6366F1]/40 text-[#E0E7FF] font-semibold text-[10px] rounded-lg shadow-xs">
          DEV ONLY
        </span>
      </div>

      {/* Hardware & Platform Overview */}
      <div className="bg-linear-to-b from-[#292524] to-[#1F1C1A] rounded-2xl p-4 border border-[#44403C] space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between border-b border-[#44403C]/80 pb-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-[#818CF8]" />
            <span className="font-semibold text-[#FAFAF9]">Runtime Platform</span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-lg font-semibold text-[10px] shadow-xs ${
              isNativePlatform
                ? 'bg-[#134E4A] text-[#5EEAD4] border border-[#0D9488]'
                : 'bg-[#312E81] text-[#C7D2FE] border border-[#4338CA]'
            }`}
          >
            {isNativePlatform ? 'Android Native (Capacitor)' : 'Web Browser (Simulated)'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#141211] p-2.5 rounded-xl border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E] block text-[10px]">Active Provider</span>
            <span className="font-semibold text-[#C7D2FE] mt-0.5 block">
              {diagnostics.providerType}
            </span>
          </div>

          <div className="bg-[#141211] p-2.5 rounded-xl border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E] block text-[10px]">Engine Status</span>
            <span className="font-semibold text-[#5EEAD4] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-ping" />
              {diagnostics.status}
            </span>
          </div>

          <div className="bg-[#141211] p-2.5 rounded-xl border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E] block text-[10px]">BLE Advertising</span>
            <span
              className={`font-semibold mt-0.5 block ${
                diagnostics.isAdvertising ? 'text-[#5EEAD4]' : 'text-[#78716C]'
              }`}
            >
              {diagnostics.isAdvertising ? 'ACTIVE (Open)' : 'OFF (Closed)'}
            </span>
          </div>

          <div className="bg-[#141211] p-2.5 rounded-xl border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E] block text-[10px]">BLE Scanning</span>
            <span
              className={`font-semibold mt-0.5 block ${
                diagnostics.isScanning ? 'text-[#5EEAD4]' : 'text-[#78716C]'
              }`}
            >
              {diagnostics.isScanning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
        </div>

        {isNativePlatform && (
          <div className="pt-2 border-t border-[#44403C]/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-[#D6D3D1]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span>Android Permissions:</span>
            </div>
            <button
              type="button"
              onClick={handleRequestPerms}
              disabled={requestingPerms}
              className="px-2.5 py-1 bg-[#3730A3] hover:bg-[#312E81] text-white rounded-lg text-[10px] font-semibold cursor-pointer transition shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-[0.5px]"
            >
              {requestingPerms ? 'Requesting...' : 'Request Perms'}
            </button>
          </div>
        )}
      </div>

      {/* Protocol & Ephemeral Identity Info */}
      <div className="bg-linear-to-b from-[#292524] to-[#1F1C1A] rounded-2xl p-4 border border-[#44403C] space-y-2 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h4 className="font-semibold text-[#E7E5E4] flex items-center gap-1.5">
          <Bluetooth className="w-3.5 h-3.5 text-[#818CF8]" />
          SAYVI Protocol v{diagnostics.protocolVersion}
        </h4>

        <div className="space-y-1.5 text-[10px] text-[#D6D3D1]">
          <div className="flex justify-between bg-[#141211] p-2 rounded-lg border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E]">Custom Service UUID:</span>
            <span className="text-[#C7D2FE] font-mono">a7e85a56...6789</span>
          </div>

          <div className="flex justify-between bg-[#141211] p-2 rounded-lg border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E]">Current Ephemeral ID:</span>
            <span className="text-amber-300 font-mono">
              {diagnostics.currentTemporaryId || 'None'}
            </span>
          </div>

          <div className="flex justify-between bg-[#141211] p-2 rounded-lg border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="text-[#A8A29E]">PII in Air Packets:</span>
            <span className="text-[#5EEAD4] font-semibold">0% (Zero PII Broadcast)</span>
          </div>
        </div>
      </div>

      {/* Detected Raw Devices Stream */}
      <div className="bg-linear-to-b from-[#292524] to-[#1F1C1A] rounded-2xl p-4 border border-[#44403C] space-y-3 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Signal className="w-4 h-4 text-[#2DD4BF]" />
            <h4 className="font-semibold text-[#FAFAF9]">
              Discovered Devices ({diagnostics.devices.length})
            </h4>
          </div>
          <span className="text-[10px] text-[#A8A29E]">
            Last packet: {formatTime(diagnostics.lastDetectionTime)}
          </span>
        </div>

        {diagnostics.devices.length === 0 ? (
          <div className="p-4 bg-[#141211] rounded-xl text-center text-[#78716C] border border-[#2E2A27] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            No active BLE advertisement packets in range
          </div>
        ) : (
          <div className="space-y-2">
            {diagnostics.devices.map((device: NearbyDevice, idx) => (
              <div
                key={device.temporaryId || idx}
                className="bg-[#141211] border border-[#2E2A27] p-3 rounded-xl space-y-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#C7D2FE] text-[11px]">
                    {device.temporaryId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shadow-xs ${
                      device.estimatedProximity === 'VERY_CLOSE'
                        ? 'bg-[#134E4A] text-[#5EEAD4] border border-[#0D9488]'
                        : device.estimatedProximity === 'NEARBY'
                        ? 'bg-[#312E81] text-[#C7D2FE] border border-[#4338CA]'
                        : 'bg-[#3B1E54] text-[#E9D5FF] border border-[#6B21A8]'
                    }`}
                  >
                    {device.estimatedProximity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] text-[#A8A29E] pt-1 border-t border-[#2E2A27]">
                  <div>
                    <span className="text-[#78716C] block">Raw RSSI:</span>
                    <span className="text-[#FAFAF9] font-semibold">{device.rawRssi ?? -70} dBm</span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Smoothed:</span>
                    <span className="text-[#5EEAD4] font-semibold">{device.smoothedRssi ?? -70} dBm</span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Source:</span>
                    <span className="text-[#FAFAF9]">{device.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-[#3730A3]/20 border border-[#4338CA]/40 rounded-xl text-[10px] text-[#C7D2FE] leading-relaxed shadow-xs">
        💡 <strong>Two-Phone Prototype Test:</strong><br />
        1. On <strong>Phone A</strong>, open diagnostics and ensure Advertising is <strong>ACTIVE</strong>.<br />
        2. On <strong>Phone B</strong>, open diagnostics and watch <strong>Discovered Devices</strong>.<br />
        3. Phone B should detect Phone A's ephemeral token with real-time RSSI!
      </div>
    </div>
  );
};

