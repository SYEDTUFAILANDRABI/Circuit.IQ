import time
import math
from .base_experiment import BaseExperiment

class LenzExperiment(BaseExperiment):
    """Calculations for the Lenz's Law Demonstration experiment."""
    
    EXP_TYPE = 'lenz'

    def calculate(self, params, button_pressed=True):
        vel = params['V']
        B = params['R']
        # L (scaled by 1e-3) is turns N in UI
        N = params['L'] * 1000.0
        
        t = time.time() * 5.0
        pulse = math.sin(t) * math.exp(-((math.sin(t * 0.5) * 3.0) ** 2))
        V_induced = N * B * vel * pulse * 0.02
        I = V_induced / 10.0
        Z = 10.0
        P = abs(V_induced * I)
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V_induced,
            'P': P
        }
