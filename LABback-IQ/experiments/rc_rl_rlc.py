import math
from .base_experiment import BaseExperiment

class RcRlRlcExperiment(BaseExperiment):
    """Calculations for the AC RLC/RL/RC experiment."""
    
    EXP_TYPE = 'rc_rl_rlc'

    def calculate(self, params, button_pressed=True):
        R_eff = params['R_eff']
        L = params['L']
        C = params['C']
        V = params['V']
        omega = params['omega']

        XL = omega * L
        XC = 1.0 / (omega * C) if (omega * C) > 0.0 else 1e9
        X = XL - XC
        Z = math.sqrt(R_eff * R_eff + X * X)
        I = V / Z if Z > 0.0 else 0.0
        phi = math.degrees(math.atan2(X, R_eff))
        
        # Resonant frequency f0 = 1 / (2 * pi * sqrt(L * C))
        if L > 0.0 and C > 0.0:
            f0 = 1.0 / (2.0 * math.pi * math.sqrt(L * C))
        else:
            f0 = 0.0
            
        P = I * I * R_eff
        
        return {
            'XL': XL,
            'XC': XC,
            'Z': Z,
            'I': I,
            'phi': phi,
            'f0': f0,
            'V': V,
            'P': P
        }
