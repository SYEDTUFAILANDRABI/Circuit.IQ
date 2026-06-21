import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import PhysicsShowcase from '../components/PhysicsShowcase';
import TeamRolesSection from '../components/TeamRolesSection';
import { useAppStore } from '../store/useAppStore';
import { Zap, Cpu, MousePointer2, FlaskConical, Bot, Send, HelpCircle, BookOpen, Terminal, Sparkles, HelpCircle as HelpIcon, ArrowRight, Gauge, Atom } from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AntigravityHero = lazy(() => import('../components/AntigravityHero'));
const CyberpunkLedMatrix = lazy(() => import('../components/CyberpunkLedMatrix'));

interface ExperimentItem {
  id: string;
  name: string;
  desc: string;
  aim: string;
  formula: string;
}

interface DomainCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  experiments: ExperimentItem[];
}

const PHYSICS_DOMAINS: DomainCategory[] = [
  {
    id: "circuits",
    title: "Electricity & Circuits",
    icon: "⚡",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400",
    experiments: [
      { id: "ohms", name: "Ohm's Law Verification", desc: "Study linear voltage-current relations in conductors.", aim: "Verify V = I × R.", formula: "V = I × R" },
      { id: "kvl", name: "Kirchhoff's Voltage Law", desc: "Verify loop voltage summation equals zero.", aim: "Verify sum of voltages around closed loop is zero.", formula: "Σ V = 0" },
      { id: "kcl", name: "Kirchhoff's Current Law", desc: "Verify nodal charge conservation.", aim: "Verify sum of currents entering junction equals currents exiting.", formula: "Σ I_in = Σ I_out" },
      { id: "rc_rl_rlc", name: "RC/RL/RLC AC Circuits", desc: "Analyze reactive components impedance.", aim: "Measure phase angle and total impedance.", formula: "Z = √[R² + (X_L - X_C)²]" },
      { id: "series_parallel", name: "Series & Parallel Loads", desc: "Analyze equivalent resistance combinations.", aim: "Compare additive vs reciprocal sum R.", formula: "R_eq = R1 + R2 | 1/R_eq = 1/R1 + 1/R2" },
      { id: "wheatstone", name: "Wheatstone Bridge", desc: "Measure unknown resistance via bridge balance.", aim: "Verify null detector voltage at balance.", formula: "R1 / R2 = R3 / R4" },
      { id: "diode_iv", name: "Diode I-V Characteristics", desc: "Study PN junction exponential forward and reverse bias current.", aim: "Verify the I-V characteristics of a semiconductor diode (PN Junction).", formula: "I = I_s * (e^(V_d / n V_t) - 1)" },
      { id: "voltage_divider", name: "Voltage & Current Divider", desc: "Analyze voltage drops and branch currents division ratios.", aim: "Verify the voltage division rule in series and current division in parallel circuits.", formula: "V_out = V_in * [R2 / (R1 + R2)]" },
      { id: "led", name: "LED Color & Planck's Constant", desc: "Study LED wavelength threshold turn-on voltages.", aim: "Determine Planck's constant by measuring the turn-on voltage of different colored LEDs.", formula: "e × V_th = h × ν" },
      { id: "lcr", name: "Series LCR Resonance", desc: "Find inductive and capacitive cancellation resonance point.", aim: "Determine resonant frequency of LCR series circuit.", formula: "f₀ = 1 / (2π√(LC))" },
      { id: "rc", name: "RC Time Constant", desc: "Study capacitor charging transient voltage profiles.", aim: "Measure transient capacitor charging rate.", formula: "τ = R × C" }
    ]
  },
  {
    id: "magnetism",
    title: "Electromagnetism",
    icon: "🧲",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400",
    experiments: [
      { id: "faraday", name: "Faraday's Induction Law", desc: "Induce voltage by moving magnet flux changes through coil.", aim: "Induce emf via moving magnetic fields.", formula: "E = -N (ΔΦ / Δt)" },
      { id: "lenz", name: "Lenz's Law Demonstration", desc: "Verify that induced voltage direction opposes flux changes.", aim: "Study induced magnetic field polarity directions.", formula: "Direction opposes dΦ/dt" },
      { id: "solenoid", name: "Solenoid Magnetic Field", desc: "Map magnetic flux density variations inside a coil.", aim: "Measure B-field inside current-carrying solenoid.", formula: "B = μ₀ n I" },
      { id: "transformer", name: "AC Transformer Ratio", desc: "Analyze voltage step-up/step-down coupling ratios.", aim: "Study voltage conversion ratios of transformers.", formula: "V_s / V_p = N_s / N_p" },
      { id: "biot_savart", name: "Biot-Savart's Law", desc: "Measure field decay curves around current carrying straight conductor.", aim: "Verify the relation between magnetic field, current, and distance from a straight conductor.", formula: "B = (μ₀ × I) / (2π × r)" }
    ]
  },
  {
    id: "thermo",
    title: "Thermodynamics",
    icon: "🔥",
    color: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400",
    experiments: [
      { id: "ideal_gas", name: "Ideal Gas State Equation", desc: "Study pressure, volume and temperature state equations.", aim: "Verify P-V-T thermodynamic relationships.", formula: "P V = n R T" },
      { id: "boyle", name: "Boyle's Constant Temp Law", desc: "Measure volume contraction ratio under scaling pressure.", aim: "Verify P-V inverse pressure volume relations.", formula: "P1 V1 = P2 V2" },
      { id: "charles", name: "Charles's Constant Pres Law", desc: "Observe linear volume expansion under thermal scaling.", aim: "Verify V-T volume temperature linear relations.", formula: "V1 / T1 = V2 / T2" },
      { id: "specific_heat", name: "Specific Heat Capacity", desc: "Trace specific heat ratios of metals using calorimetry.", aim: "Measure copper thermal specific heat.", formula: "Q = m c ΔT" },
      { id: "stefan_law", name: "Stefan's Law Verification", desc: "Verify energy radiation scaling with fourth power of temperature.", aim: "Verify the Stefan-Boltzmann law relating total radiated energy to absolute temperature.", formula: "P = σ × ε × A × T⁴" }
    ]
  },
  {
    id: "modern",
    title: "Modern Physics",
    icon: "⚛",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    experiments: [
      { id: "photoelectric", name: "Photoelectric Effect", desc: "Verify work function quantum barriers.", aim: "Determine stopping voltage vs light wavelength.", formula: "Kmax = h ν - Φ" },
      { id: "planck_photocell", name: "Planck's Constant (Photocell)", desc: "Calculate h constant via phototube stopping voltage.", aim: "Find Planck's constant using photoelectric effect in a vacuum photocell.", formula: "e × Vs = h × f − Φ" },
      { id: "planck_led", name: "Planck's Constant using LEDs", desc: "Measure turn-on voltages of multiple LEDs to estimate Planck's constant.", aim: "Determine Planck's constant by measuring the turn-on voltage of different colored LEDs.", formula: "h = (e × V_th × λ) / c" },
      { id: "radioactive", name: "Radioactive Decay Half-Life", desc: "Observe parent nuclei counts half-life reduction rates.", aim: "Verify nuclei exponential decay rate.", formula: "N(t) = N₀ e^(-λ t)" },
      { id: "de_broglie", name: "de Broglie matter wave", desc: "Determine quantum matter wave duality limits.", aim: "Measure wave characteristics of moving masses.", formula: "λ = h / (m v)" },
      { id: "bohr_model", name: "Bohr Hydrogen atom transitions", desc: "Study discrete photon emissions on orbital energy drops.", aim: "Calculate transition shell wavelengths.", formula: "E = 13.6 (1/n_f² - 1/n_i²) eV" }
    ]
  }
];

function BotMessage({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const words = text.split(' ');
    let currentText = '';
    
    const timer = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index];
        setDisplayedText(currentText);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [text]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

interface LightningArc {
  path: Array<{ x: number; y: number }>;
  alpha: number;
  color: string;
  duration: number;
  maxDuration: number;
}

function CyberCircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cols = Math.ceil(width / 80) + 1;
    const rows = Math.ceil(height / 80) + 1;
    const nodes: Array<{ x: number; y: number; originalX: number; originalY: number; id: number }> = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * 80 + (Math.random() - 0.5) * 20;
        const y = r * 80 + (Math.random() - 0.5) * 20;
        nodes.push({ x, y, originalX: x, originalY: y, id: c * rows + r });
      }
    }

    const wires: Array<{ from: typeof nodes[0]; to: typeof nodes[0]; length: number }> = [];
    nodes.forEach(node => {
      const neighbors = nodes.filter(n => {
        if (n.id === node.id) return false;
        const d = Math.hypot(n.x - node.x, n.y - node.y);
        return d < 120;
      });
      const connections = neighbors.sort(() => 0.5 - Math.random()).slice(0, 2);
      connections.forEach(n => {
        if (!wires.some(w => (w.from.id === node.id && w.to.id === n.id) || (w.from.id === n.id && w.to.id === node.id))) {
          wires.push({ from: node, to: n, length: Math.hypot(n.x - node.x, n.y - node.y) });
        }
      });
    });

    const particles: Array<{ wire: typeof wires[0]; progress: number; speed: number; direction: 1 | -1; color: string }> = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

    const spawnParticle = () => {
      if (wires.length === 0 || particles.length > 40) return;
      const wire = wires[Math.floor(Math.random() * wires.length)];
      particles.push({
        wire,
        progress: 0,
        speed: (0.5 + Math.random() * 1.5) / wire.length,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    for (let i = 0; i < 25; i++) {
      spawnParticle();
    }

    let sparks: Spark[] = [];
    let lightningArcs: LightningArc[] = [];

    const generateLightningPath = (x1: number, y1: number, x2: number, y2: number, segments = 4, offset = 15) => {
      let path = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      for (let s = 0; s < segments; s++) {
        const nextPath = [];
        for (let i = 0; i < path.length - 1; i++) {
          const p1 = path[i];
          const p2 = path[i + 1];
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          if (len > 5) {
            const nx = -dy / len;
            const ny = dx / len;
            const disp = (Math.random() - 0.5) * offset * (1 / (s * 0.8 + 1));
            nextPath.push(p1);
            nextPath.push({ x: mx + nx * disp, y: my + ny * disp });
          } else {
            nextPath.push(p1);
          }
        }
        nextPath.push(path[path.length - 1]);
        path = nextPath;
      }
      return path;
    };

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (Math.random() < 0.65) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 4.5,
          vy: (Math.random() - 0.7) * 4 - 2.5,
          alpha: 1,
          size: Math.random() * 1.5 + 1.0,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const currentTheme = useAppStore.getState().theme;
      ctx.fillStyle = currentTheme === 'light' ? 'rgba(248, 250, 252, 0.25)' : 'rgba(7, 11, 25, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle warped circuit grid wires
      ctx.strokeStyle = currentTheme === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(30, 41, 59, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      nodes.forEach(node => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          const force = (140 - d) / 140;
          node.x += (mouse.x - node.x) * force * 0.05;
          node.y += (mouse.y - node.y) * force * 0.05;
        } else {
          node.x += (node.originalX - node.x) * 0.05;
          node.y += (node.originalY - node.y) * 0.05;
        }
      });

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.03)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      wires.forEach(wire => {
        ctx.moveTo(wire.from.x, wire.from.y);
        ctx.lineTo(wire.to.x, wire.to.y);
      });
      ctx.stroke();

      // Update and draw lightning arcs
      if (Math.random() < 0.01 && nodes.length > 1 && lightningArcs.length < 2) {
        const n1 = nodes[Math.floor(Math.random() * nodes.length)];
        const eligible = nodes.filter(n => {
          if (n.id === n1.id) return false;
          const d = Math.hypot(n.x - n1.x, n.y - n1.y);
          return d > 40 && d < 180;
        });
        if (eligible.length > 0) {
          const n2 = eligible[Math.floor(Math.random() * eligible.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          lightningArcs.push({
            path: generateLightningPath(n1.x, n1.y, n2.x, n2.y),
            alpha: 1.0,
            color: color,
            duration: 0,
            maxDuration: 10 + Math.floor(Math.random() * 8)
          });
        }
      }

      const activeArcs: LightningArc[] = [];
      lightningArcs.forEach(arc => {
        arc.duration++;
        arc.alpha = 1 - (arc.duration / arc.maxDuration);
        if (arc.alpha > 0) {
          activeArcs.push(arc);
          
          ctx.save();
          ctx.globalAlpha = arc.alpha * (Math.random() > 0.35 ? 1.0 : 0.3); // crackling effect
          ctx.shadowBlur = 12;
          ctx.shadowColor = arc.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.random() * 1.5 + 0.6;
          
          ctx.beginPath();
          ctx.moveTo(arc.path[0].x, arc.path[0].y);
          for (let i = 1; i < arc.path.length; i++) {
            ctx.lineTo(arc.path[i].x, arc.path[i].y);
          }
          ctx.stroke();
          
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = ctx.lineWidth * 2.5;
          ctx.stroke();
          ctx.restore();
        }
      });
      lightningArcs = activeArcs;

      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          if (wires.length > 0) {
            const wire = wires[Math.floor(Math.random() * wires.length)];
            p.wire = wire;
            p.progress = 0;
            p.speed = (0.5 + Math.random() * 1.5) / wire.length;
            p.direction = Math.random() > 0.5 ? 1 : -1;
            p.color = colors[Math.floor(Math.random() * colors.length)];
          }
        }

        const start = p.direction === 1 ? p.wire.from : p.wire.to;
        const end = p.direction === 1 ? p.wire.to : p.wire.from;

        const x = start.x + (end.x - start.x) * p.progress;
        const y = start.y + (end.y - start.y) * p.progress;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // Update and draw sparks
      ctx.save();
      const activeSparks: Spark[] = [];
      sparks.forEach(spark => {
        spark.vy += 0.08; // gravity
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= 0.025; // decay
        if (spark.alpha > 0) {
          activeSparks.push(spark);
          ctx.globalAlpha = spark.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = spark.color;
          ctx.fillStyle = spark.color;
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      sparks = activeSparks;
      ctx.restore();

      ctx.fillStyle = currentTheme === 'light' ? 'rgba(15, 23, 42, 0.12)' : 'rgba(148, 163, 184, 0.15)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

function ExperimentCard({ exp, categoryColor, onLaunch }: { exp: ExperimentItem; categoryColor: string; onLaunch: (id: string) => void }) {
  const theme = useAppStore((state) => state.theme);
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const card = cardRef.current;
  let rotateX = 0;
  let rotateY = 0;
  let glowX = 50;
  let glowY = 50;

  if (card && isHovered) {
    const width = card.clientWidth;
    const height = card.clientHeight;
    const xPct = (coords.x / width) - 0.5;
    const yPct = (coords.y / height) - 0.5;
    
    rotateX = -yPct * 20; 
    rotateY = xPct * 20;
    glowX = (coords.x / width) * 100;
    glowY = (coords.y / height) * 100;
  }

  let glowColor = "rgba(59, 130, 246, 0.45)"; // default blue
  if (categoryColor.includes("purple") || categoryColor.includes("pink")) {
    glowColor = "rgba(168, 85, 247, 0.45)";
  } else if (categoryColor.includes("rose") || categoryColor.includes("red")) {
    glowColor = "rgba(244, 63, 94, 0.45)";
  } else if (categoryColor.includes("emerald") || categoryColor.includes("teal")) {
    glowColor = "rgba(16, 185, 129, 0.45)";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'none' : 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease, background-color 0.3s ease',
        boxShadow: isHovered 
          ? (theme === 'light' 
              ? `0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 25px 3px ${glowColor.replace('0.45', '0.15')}` 
              : `0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 25px 3px ${glowColor.replace('0.45', '0.25')}`) 
          : (theme === 'light' 
              ? '0 8px 24px -12px rgba(0, 0, 0, 0.08)' 
              : '0 10px 30px -15px rgba(0, 0, 0, 0.5)'),
        borderColor: isHovered 
          ? glowColor 
          : (theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)'),
      }}
      className="p-6 rounded-2xl border bg-white/85 dark:bg-slate-950/75 backdrop-blur-xl flex flex-col justify-between group text-left relative overflow-hidden h-full cursor-pointer transition-colors duration-300"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div 
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${glowColor}, transparent)`
          }}
          className="w-1/2 h-full animate-[scanLine_2.5s_linear_infinite]" 
        />
      </div>

      <div
        style={{
          background: isHovered 
            ? `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor.replace('0.45', '0.15')} 0%, transparent 60%)` 
            : 'none',
          transition: 'background 0.2s ease',
        }}
        className="absolute inset-0 pointer-events-none z-10"
      />

      <div 
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${glowColor.replace('0.45', '0.04')}, transparent, ${glowColor.replace('0.45', '0.04')})`
        }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
      />

      <div className="flex flex-col gap-2 relative z-20" style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
        <div className="flex justify-between items-start" style={{ transform: 'translateZ(10px)' }}>
          <span 
            style={{
              color: glowColor.replace('0.45', '1')
            }}
            className="text-[10px] font-mono uppercase tracking-widest font-extrabold"
          >
            Lab Module
          </span>
          <div className="relative w-3 h-3 flex items-center justify-center">
            <div 
              style={{ backgroundColor: glowColor.replace('0.45', '0.4') }}
              className="absolute inset-0 rounded-full animate-ping" 
            />
            <div 
              style={{
                background: `linear-gradient(to bottom right, #fff, ${glowColor.replace('0.45', '1')})`,
                boxShadow: `0 0 8px ${glowColor}`
              }}
              className="w-1.5 h-1.5 rounded-full group-hover:scale-150 transition-transform" 
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1 group-hover:text-slate-950 dark:group-hover:text-white transition-colors duration-200" style={{ transform: 'translateZ(20px)' }}>
          {exp.name}
        </h3>
        
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-light" style={{ transform: 'translateZ(15px)' }}>
          {exp.desc}
        </p>
        
        <div 
          style={{ transform: 'translateZ(25px)' }}
          className="bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5 rounded-xl p-3.5 mt-4 flex flex-col gap-1 group-hover:border-slate-200 dark:group-hover:border-white/10 transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">Core Equation:</span>
          <code 
            style={{ color: glowColor.replace('0.45', '0.9') }}
            className="text-[11px] font-mono font-bold"
          >
            {exp.formula}
          </code>
        </div>
      </div>

      <div className="relative z-20 mt-6" style={{ transform: 'translateZ(40px)' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLaunch(exp.id);
          }}
          style={{
            boxShadow: isHovered ? `0 8px 20px -6px ${glowColor}` : 'none'
          }}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-colors"
        >
          <span>Launch Experiment</span>
          <Zap size={12} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function DeferRender({ children }: { children: React.ReactNode }) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full min-h-[400px] flex items-center justify-center">
      {shouldRender ? children : (
        <div className="font-mono text-xs text-slate-500 tracking-widest uppercase animate-pulse flex flex-col items-center gap-2 py-10">
          <div className="w-6 h-6 rounded-full border border-t-blue-500 border-r-transparent border-b-transparent border-l-blue-500 animate-spin" />
          <span>Loading Visual Modules...</span>
        </div>
      )}
    </div>
  );
}

export default function LandingPage({ view = 'home' }: { view?: 'home' | 'experiments' | 'physicsbot' }) {
  const setLabOpen = useAppStore((state) => state.setLabOpen);
  const setCurrentExperiment = useAppStore((state) => state.setCurrentExperiment);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const [activeCategory, setActiveCategory] = useState("circuits");
  
  // PhysicsBot State
  const [botQuestion, setBotQuestion] = useState("");
  const [botChatHistory, setBotChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; formulas?: Array<{ name: string; expr: string }>; recommendedExp?: string }>>([]);
  const [botLoading, setBotLoading] = useState(false);

  useEffect(() => {
    setBotChatHistory([
      {
        sender: 'bot',
        text: "Hello! I am PhysicsBot, your virtual AI tutor. Ask me any physics question from our core domains (Circuits, Electromagnetism, Thermodynamics, or Quantum/Modern Physics) and I will provide step-by-step solutions, equations, and let you load active 3D simulations!"
      }
    ]);
  }, []);

  const handleLaunchExperiment = (id: string) => {
    setCurrentExperiment(id);
    setLabOpen(true);
  };

  const handleBotSubmit = async (queryText: string) => {
    if (!queryText.trim() || botLoading) return;
    
    const newHistory = [...botChatHistory, { sender: 'user' as const, text: queryText }];
    setBotChatHistory(newHistory);
    setBotQuestion("");
    setBotLoading(true);
    
    try {
      const response = await fetch('/api/physics-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: queryText })
      });
      if (response.ok) {
        const data = await response.json();
        setBotChatHistory([...newHistory, {
          sender: 'bot',
          text: data.explanation,
          formulas: data.formulas,
          recommendedExp: data.recommendedExp
        }]);
      } else {
        throw new Error("API status failed");
      }
    } catch (err) {
      console.warn("Failed to contact PhysicsBot API, generating local response.", err);
      let explanation = "I analyzed your question, but could not contact the backend. Locally, I can tell you that physics follows strict mathematical boundaries. Select a specific domain to explore its core relationships.";
      let formulas = [{ name: "Mass-Energy", expr: "E = m c²" }];
      let recommendedExp = undefined;
      
      const qLower = queryText.toLowerCase();
      if (qLower.includes('ohm') || qLower.includes('resistor') || qLower.includes('voltage')) {
        explanation = "Ohm's Law governs electrical currents in resistive paths. Under constant temperature, current is directly proportional to voltage and inversely proportional to resistance.";
        formulas = [{ name: "Ohm's Law", expr: "V = I × R" }];
        recommendedExp = "ohms";
      } else if (qLower.includes('lcr') || qLower.includes('resonance')) {
        explanation = "In series LCR resonance, inductive and capacitive reactances cancel out. Total impedance drops to equal the resistance R, generating maximum current flow.";
        formulas = [{ name: "Resonance", expr: "f₀ = 1 / (2π√(LC))" }];
        recommendedExp = "lcr";
      } else if (qLower.includes('pendulum') || qLower.includes('gravity')) {
        explanation = "A simple pendulum swings in simple harmonic motion. Its period depends on length L and gravity g, not the bob mass.";
        formulas = [{ name: "Period", expr: "T = 2π √(L / g)" }];
        recommendedExp = "pendulum";
      } else if (qLower.includes('snell') || qLower.includes('refraction')) {
        explanation = "Light bends when entering a new refractive medium. Snell's law relates the sine ratio of incident and refractive angles.";
        formulas = [{ name: "Snell's Law", expr: "n₁ sin(θ₁) = n₂ sin(θ₂)" }];
        recommendedExp = "snell";
      } else if (qLower.includes('gas') || qLower.includes('boyle') || qLower.includes('charles')) {
        explanation = "Gases follow PV = nRT. Boyle's law describes inverse P-V pressure-volume states, and Charles's law describes linear volume-temperature expansion.";
        formulas = [{ name: "Ideal Gas", expr: "P V = n R T" }];
        recommendedExp = "ideal_gas";
      } else if (qLower.includes('photoelectric') || qLower.includes('photon')) {
        explanation = "Photoelectric emission occurs when incident photon energy exceeds the metal work function Φ, ejecting electrons at speed proportional to stopping voltage.";
        formulas = [{ name: "Einstein's Photoelectric", expr: "Kmax = h ν - Φ" }];
        recommendedExp = "photoelectric";
      }
      
      setBotChatHistory([...newHistory, {
        sender: 'bot',
        text: explanation,
        formulas: formulas,
        recommendedExp: recommendedExp
      }]);
    } finally {
      setBotLoading(false);
    }
  };

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view !== 'home') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ultra-smooth exponential ease-out
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

      tl.to(heroTitleRef.current, {
        y: 250,
        scale: 0.8,
        opacity: 0,
        letterSpacing: "0.15em",
        rotateX: 45,
        rotateZ: 5,
        filter: "blur(10px)",
        ease: "none"
      }, 0);

      tl.to(heroDescRef.current, {
        y: 200,
        opacity: 0,
        ease: "none"
      }, 0);

      tl.to(heroButtonsRef.current, {
        y: 150,
        opacity: 0,
        ease: "none"
      }, 0);

      tl.to(scrollIndicatorRef.current, {
        opacity: 0,
        ease: "none"
      }, 0);
    });
    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateRaf);
      ctx.revert();
    };
  }, [view]);

  return (
    <div className="relative bg-transparent">
      {/* 3D Hero background Canvas (always mounted) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ease-out"
        style={{ 
          opacity: view === 'home' ? 1 : 0,
          visibility: view === 'home' ? 'visible' : 'hidden'
        }}
      >
        <Suspense fallback={null}>
          <AntigravityHero active={view === 'home'} />
        </Suspense>
      </div>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative min-h-[300vh] bg-transparent"
          >
            {/* Hero Content */}
            <section id="hero-section" className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
                  <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span>Next-Gen Simulation Engine</span>
                </div>
                
                <h1 
                  ref={heroTitleRef}
                  className="text-8xl md:text-9xl font-display font-bold text-cinematic mb-6 leading-none"
                >
                  Circuit.IQ
                </h1>
                
                <p 
                  ref={heroDescRef}
                  className="max-w-2xl mx-auto text-2xl text-slate-500 dark:text-slate-400 font-light italic mb-12 leading-relaxed"
                >
                  AI-Powered Virtual Physics Laboratory for the <span className="text-blue-600 dark:text-blue-400">Modern Engineer</span>.
                </p>

                <div ref={heroButtonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={() => setLabOpen(true)}
                    className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                  >
                    Start Experimenting
                    <Zap size={20} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('experiments')}
                    className="px-10 py-4 bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Explore Library
                  </button>
                </div>
              </motion.div>

              <motion.div 
                ref={scrollIndicatorRef}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50"
              >
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scroll to Build</span>
                <MousePointer2 size={16} className="text-slate-500 dark:text-slate-400" />
              </motion.div>
            </section>

            {/* Assembly Section */}
            <section id="simulation-section" className="relative h-[150vh] flex flex-col items-center justify-center pointer-events-none">
               {/* The breadboard animation happens over this scroll distance */}
            </section>

            {/* Physics Showcase Section */}
            <section id="showcase-section" className="relative py-28 w-full max-w-7xl mx-auto px-6">
              <PhysicsShowcase />
            </section>

            {/* Cyberpunk LED Matrix Showcase Component wrapped in DeferRender */}
            <section className="relative py-20 w-full overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <DeferRender>
                  <Suspense fallback={
                    <div className="w-full h-[550px] bg-slate-950/85 p-8 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-[0_24px_70px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-blue-500 animate-spin" />
                      <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">Initializing LED Matrix...</span>
                    </div>
                  }>
                    <CyberpunkLedMatrix />
                  </Suspense>
                </DeferRender>
              </div>
            </section>

            {/* Team Roles / Founders Showcase */}
            <TeamRolesSection />

            {/* Lab CTA */}
            <section className="py-24 flex flex-col items-center justify-center text-center">
                <h2 className="text-5xl md:text-6xl font-display font-medium tracking-tight mb-8 text-slate-900 dark:text-white">Ready to Experiment?</h2>
                <button 
                  onClick={() => setLabOpen(true)}
                  className="px-10 py-4.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-bold text-base hover:scale-105 transition-all shadow-xl shadow-slate-950/10 dark:shadow-white/10 animate-[pulse_4s_infinite]"
                >
                  Enter Virtual Laboratory
                </button>
            </section>

            {/* High-Fidelity Circuit.IQ Styled Footer */}
            <footer className="w-full bg-white dark:bg-space-black px-8 md:px-16 pt-24 pb-12 border-t border-slate-100 dark:border-white/5 relative z-10 transition-colors">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20 md:mb-28">
                {/* Left Column heading */}
                <div className="text-left">
                  <h3 className="text-4xl md:text-5xl font-display font-normal tracking-tight text-slate-900 dark:text-white leading-tight">
                    Ignite high-fidelity physics
                  </h3>
                </div>

                {/* Right Columns of links */}
                <div className="flex gap-16 md:gap-28 text-left pr-4 md:pr-12">
                  {/* Column A */}
                  <div className="flex flex-col gap-3.5">
                    <a href="#experiments" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Simulation Engine</a>
                    <a href="#virtual-lab" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Interactive Labs</a>
                    <a href="#formulas" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Formulas & Equations</a>
                    <a href="#changelog" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Changelog</a>
                    <a href="#sandbox" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Virtual Sandbox</a>
                    <a href="#releases" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Research Releases</a>
                  </div>

                  {/* Column B */}
                  <div className="flex flex-col gap-3.5">
                    <a href="#blog" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Academic Blog</a>
                    <a href="#pricing" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Lab Partners</a>
                    <a href="#usecases" className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Physics Systems</a>
                  </div>
                </div>
              </div>

              {/* Massive overlapping text design exactly like reference image */}
              <div className="w-full overflow-hidden text-center mb-16 select-none pointer-events-none">
                <motion.h2 
                  initial={{ y: "40%", opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: false, margin: "-120px" }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[12.8vw] font-bold tracking-tighter text-slate-950 dark:text-white leading-none font-display inline-block"
                  style={{ 
                    letterSpacing: "-0.04em",
                    fontStretch: "condensed"
                  }}
                >
                  Circuit.IQ
                </motion.h2>
              </div>

              {/* Lower branding bar */}
              <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight font-display">Circuit.IQ Live Lab</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2.5 text-[12px] text-slate-600 dark:text-slate-400">
                  <a href="#about" className="hover:text-slate-950 dark:hover:text-white transition-colors duration-200">About Circuit.IQ</a>
                  <a href="#products" className="hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Virtual Labs</a>
                  <a href="#privacy" className="hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Privacy Policy</a>
                  <a href="#terms" className="hover:text-slate-950 dark:hover:text-white transition-colors duration-200">Terms of Use</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {view === 'experiments' && (
          <motion.div
            key="experiments-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen pt-28 pb-16 bg-transparent overflow-hidden"
          >
            {/* Shifting Cybernetic Neon Orbs */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[140px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
            <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] animate-[pulse_8s_ease-in-out_infinite_1.5s] pointer-events-none" />
            <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px] animate-[pulse_10s_ease-in-out_infinite_3s] pointer-events-none" />

            {/* Experiments Explorer Section */}
            <section id="experiments-section" className="relative w-full overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                      <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-3 text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400">Virtual Laboratory Experiments</h2>
                      <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">Select any specific experiment to open the Virtual 3D Lab and begin interactive analysis immediately.</p>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {PHYSICS_DOMAINS.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-lg ${
                            activeCategory === cat.id
                              ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/20 scale-105"
                              : "bg-white dark:bg-black/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Experiments grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {PHYSICS_DOMAINS.find(cat => cat.id === activeCategory)?.experiments.map(exp => (
                        <ExperimentCard
                          key={exp.id}
                          exp={exp}
                          categoryColor={PHYSICS_DOMAINS.find(cat => cat.id === activeCategory)?.color || ""}
                          onLaunch={handleLaunchExperiment}
                        />
                      ))}
                    </div>
                </div>
            </section>
          </motion.div>
        )}

        {view === 'physicsbot' && (
          <motion.div
            key="physicsbot-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen pt-28 pb-16 bg-transparent flex items-center justify-center"
          >
            {/* Ambient Glowing Background Elements */}
            <div className="absolute top-1/4 left-10 md:left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 md:right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* PhysicsBot AI HUD Section */}
            <section id="physicsbot-section" className="relative w-full overflow-hidden bg-transparent z-10">
              <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-10 flex flex-col items-center gap-2">
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2 group">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-400 opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300" />
                    <Bot className="text-white w-7 h-7 animate-pulse" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">PhysicsBot AI Console</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-xs leading-relaxed">
                    Ask PhysicsBot queries in electrodynamics, thermodynamics, or modern physics, and get immediate step-by-step math analysis.
                  </p>
                </div>

                <div className="relative bg-white/80 dark:bg-black/45 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.12)] dark:shadow-[0_0_80px_-25px_rgba(16,185,129,0.35)] backdrop-blur-3xl overflow-hidden flex flex-col h-[550px] transition-all duration-300">
                  
                  {/* Decorative Tech Grid Overlay inside Terminal */}
                  <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* Terminal Header */}
                  <div className="px-5 py-4 bg-slate-50/90 dark:bg-black/60 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                      <div className="flex items-center gap-1.5 ml-3 font-mono text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-widest font-bold">
                        <Terminal size={12} className="text-slate-400 dark:text-emerald-500" />
                        <span>PhysicsBot v1.0 // Diagnostic Online</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Neon Signal Waveform Animation */}
                      <div className="hidden sm:flex items-center gap-1 opacity-70">
                        <span className="w-0.5 h-3 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
                        <span className="w-0.5 h-5 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                        <span className="w-0.5 h-2.5 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.9s' }} />
                        <span className="w-0.5 h-4.5 bg-cyan-400/80 rounded-full animate-bounce" style={{ animationDelay: '450ms', animationDuration: '0.7s' }} />
                        <span className="w-0.5 h-3 bg-emerald-400/70 rounded-full animate-bounce" style={{ animationDelay: '600ms', animationDuration: '0.8s' }} />
                      </div>

                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-500/20 px-3 py-1 rounded-full shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left z-10 relative scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                    {botChatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-1.5 max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        {msg.sender === 'user' ? (
                          <span className="font-mono text-[9px] text-blue-600 dark:text-blue-400/80 mr-1 select-none flex items-center gap-1 font-bold">
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            operator@circuit-iq:~$
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400/80 flex items-center gap-1 select-none ml-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            physicsbot@circuit-iq:~$
                          </span>
                        )}
                        
                        <div className="flex gap-3 w-full items-start">
                          {msg.sender === 'user' ? null : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/5">
                              <Bot size={15} />
                            </div>
                          )}
                          
                          <div className={`p-4 rounded-2xl text-[13px] leading-relaxed flex flex-col gap-2.5 ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600/15 dark:to-indigo-600/15 text-white dark:text-slate-250 border border-blue-500/20 dark:border-blue-500/10 rounded-tr-none shadow-md shadow-blue-500/5'
                              : 'bg-slate-100/90 dark:bg-emerald-950/10 text-slate-800 dark:text-emerald-100/90 border border-slate-200 dark:border-emerald-500/15 rounded-tl-none backdrop-blur-md shadow-sm'
                          }`}>
                            {msg.sender === 'bot' && idx === botChatHistory.length - 1 ? (
                              <BotMessage text={msg.text} />
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                            
                            {msg.formulas && msg.formulas.length > 0 && (
                              <div className="bg-slate-200/55 dark:bg-black/60 border border-slate-300/30 dark:border-emerald-500/10 rounded-xl p-3.5 mt-2 flex flex-col gap-2 shadow-inner font-mono">
                                <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Relevant Formulas:</span>
                                {msg.formulas.map((f, fidx) => (
                                  <div key={fidx} className="flex justify-between items-center gap-4 text-[10px] text-slate-700 dark:text-emerald-400">
                                    <span className="font-bold">{f.name}:</span>
                                    <span className="font-bold text-blue-600 dark:text-emerald-300 bg-blue-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded border border-blue-100/50 dark:border-emerald-500/10">{f.expr}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.recommendedExp && (
                              <button
                                onClick={() => handleLaunchExperiment(msg.recommendedExp!)}
                                className="mt-2.5 py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-[9px] flex items-center justify-center gap-1.5 cursor-pointer self-start tracking-wider uppercase transition-all duration-300 shadow-md shadow-emerald-500/10 hover:scale-[1.03]"
                              >
                                <span>⚡ Load simulation in lab</span>
                              </button>
                            )}
                          </div>
                          
                          {msg.sender === 'user' ? (
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                              <span className="text-xs font-bold">OP</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    
                    {botLoading && (
                      <div className="flex flex-col gap-1.5 self-start items-start">
                        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 select-none ml-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          physicsbot@circuit-iq:~$ [AI COGNITIVE SEARCH...]
                        </span>
                        <div className="flex gap-2.5 items-start">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/5">
                            <Bot size={15} className="animate-pulse" />
                          </div>
                          <div className="p-3.5 bg-slate-100/90 dark:bg-emerald-950/10 border border-slate-200 dark:border-emerald-500/10 rounded-2xl rounded-tl-none flex items-center gap-2 backdrop-blur-md shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions row */}
                  <div className="px-5 py-3 bg-slate-50/80 dark:bg-white/1 border-t border-slate-200/80 dark:border-white/5 flex gap-2 overflow-x-auto select-none no-scrollbar z-10 relative">
                    <button
                      onClick={() => handleBotSubmit("Explain Ohm's Law and solve for I when V=12V, R=100Ω")}
                      className="px-3.5 py-1.8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:scale-[1.02]"
                    >
                      <span className="text-emerald-500 font-bold">$</span>
                      <span>ohms-solver</span>
                    </button>
                    <button
                      onClick={() => handleBotSubmit("Find the LCR resonant frequency for L=50mH, C=100µF")}
                      className="px-3.5 py-1.8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:scale-[1.02]"
                    >
                      <span className="text-emerald-500 font-bold">$</span>
                      <span>lcr-resonance</span>
                    </button>
                    <button
                      onClick={() => handleBotSubmit("Solve the Ideal Gas pressure for V=22.4L, T=273K, n=1")}
                      className="px-3.5 py-1.8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:scale-[1.02]"
                    >
                      <span className="text-emerald-500 font-bold">$</span>
                      <span>ideal-gas</span>
                    </button>
                    <button
                      onClick={() => handleBotSubmit("Explain Photoelectric Effect stopping voltage")}
                      className="px-3.5 py-1.8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:scale-[1.02]"
                    >
                      <span className="text-emerald-500 font-bold">$</span>
                      <span>photoelectric-effect</span>
                    </button>
                  </div>

                  {/* Chat Input */}
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleBotSubmit(botQuestion); }}
                    className="p-4 bg-slate-100/90 dark:bg-black/50 border-t border-slate-200/80 dark:border-white/10 flex gap-3 z-10 relative"
                  >
                    <div className="flex-1 bg-white dark:bg-black/60 border border-slate-200 dark:border-white/15 rounded-xl flex items-center px-4 focus-within:border-emerald-500 dark:focus-within:border-emerald-500/60 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300">
                      <span className="font-mono text-[10px] text-blue-500 dark:text-blue-400 mr-2 select-none font-bold">operator:~$</span>
                      <input
                        type="text"
                        placeholder="Ask PhysicsBot a physics question..."
                        value={botQuestion}
                        onChange={(e) => setBotQuestion(e.target.value)}
                        disabled={botLoading}
                        className="flex-1 bg-transparent border-none outline-none text-xs py-2.5 dark:text-white dark:placeholder-slate-500 focus:ring-0"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!botQuestion.trim() || botLoading}
                      className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all duration-300 cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.04]"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .text-gradient {
          background: linear-gradient(to right, #3b82f6, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function CategoryCard({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) {
  return (
    <div className="glass-panel p-8 group hover:border-blue-500/30 transition-colors cursor-pointer bg-white/80 dark:bg-black/40">
      <div className="text-blue-600 dark:text-blue-400 mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-display font-bold mb-4 text-slate-900 dark:text-white">{title}</h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}


