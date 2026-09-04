import React, { useEffect, useRef, useState } from 'react';

export default function TerminalPanel({ verificationLogs }) {
  const terminalEndRef = useRef(null);
  const [consoleInput, setConsoleInput] = useState('');
  const [logs, setLogs] = useState([
    "> REVGUARD AI RECOVERY AGENT — TELEMETRY ONLINE",
    "> AUDIT TRAIL IMMUTABLE LEDGER INITIALIZED... [OK]",
    "> POLICY GUARDRAILS ENGINE ENFORCED: 8/8 RULES... [OK]",
    "> AWAITING TELEMETRY VERIFICATION..."
  ]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // React to verification requests from parent Ledger
  useEffect(() => {
    if (verificationLogs && verificationLogs.length > 0) {
      setLogs(prev => [...prev, ...verificationLogs]);
    }
  }, [verificationLogs]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    
    const cmd = consoleInput.toUpperCase().trim();
    let response = `> COMMAND NOT RECOGNIZED: "${cmd}". TYPE "HELP" FOR OPTIONS.`;
    
    if (cmd === 'HELP') {
      response = `> REVGUARD PROTOCOLS:\n  - HELP: Show this manual\n  - STATUS: Query active AI agent telemetry\n  - POLICY: Print enforced recovery guardrails\n  - VERIFY: Cryptographic audit checksum scan\n  - CLEAR: Flush console buffer`;
    } else if (cmd === 'STATUS') {
      response = `> AI RECOVERY AGENT: ACTIVE\n  - REVENUE_AT_RISK: ₹42.8L\n  - RECOVERED_FUNDS: ₹13.7L\n  - AUTONOMOUS_EFFICIENCY: 32.0%\n  - BOUNDED_EXECUTION: ENFORCED`;
    } else if (cmd === 'POLICY') {
      response = `> POLICY ENGINE GUARDRAILS:\n  - MAX_RETRIES: 2 attempts\n  - MAX_REMINDERS: 2 communications\n  - ESCALATION_LIMIT: > ₹5,00,000\n  - STOP_RULES: On-Payment, On-OptOut, Max-Attempts`;
    } else if (cmd === 'CLEAR') {
      setLogs([]);
      setConsoleInput('');
      return;
    } else if (cmd === 'VERIFY') {
      response = `> SCANNING SHA-256 AUDIT LOG MERKLE ROOTS...\n> BLOCKS VERIFIED: 1,482 AUDIT ENTRIES\n> CRYPTOGRAPHIC PROOF: 100% VALID & IMMUTABLE`;
    }

    setLogs(prev => [...prev, `> ${consoleInput}`, ...response.split('\n')]);
    setConsoleInput('');
  };

  return (
    <aside className="w-full md:w-[320px] bg-surface border-t md:border-t-0 md:border-l border-border-low flex flex-col h-[350px] md:h-full shrink-0">
      <div className="p-4 border-b border-border-low bg-surface-dim select-none">
        <h3 className="font-label-caps text-xs text-primary uppercase flex items-center gap-2 font-bold tracking-wider">
          <span className="material-symbols-outlined text-sm animate-pulse">terminal</span> 
          Compliance &amp; Telemetry
        </h3>
      </div>
      <div className="p-4 flex-grow bg-surface-container-lowest overflow-y-auto font-mono text-[11px] leading-relaxed text-muted-slate space-y-1 select-text">
        {logs.map((log, idx) => {
          let styleClass = "";
          if (log.includes("ONLINE") || log.includes("VALID") || log.includes("OK")) {
            styleClass = "text-secondary font-semibold";
          } else if (log.includes("ERROR") || log.includes("BLOCKED")) {
            styleClass = "text-error-red";
          } else if (log.includes("COMMAND NOT RECOGNIZED")) {
            styleClass = "text-primary";
          } else if (log.startsWith("> ")) {
            styleClass = "text-on-surface";
          }
          return (
            <div key={idx} className={styleClass}>
              {log}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
      <form onSubmit={handleCommandSubmit} className="p-2 border-t border-border-low bg-surface-dim flex items-center">
        <span className="text-primary text-xs font-mono px-2 select-none">&gt;</span>
        <input 
          type="text" 
          value={consoleInput}
          onChange={(e) => setConsoleInput(e.target.value)}
          placeholder="TYPE 'HELP' OR 'STATUS'..."
          className="bg-transparent border-none text-on-surface font-mono text-xs w-full focus:outline-none placeholder-muted-slate/50"
        />
      </form>
    </aside>
  );
}
