import math
from .base_experiment import BaseExperiment

class SolenoidExperiment(BaseExperiment):
    """Calculations for the Solenoid Magnetic Field experiment."""
    
    EXP_TYPE = 'solenoid'

    def calculate(self, params, button_pressed=True):
        current = params['V']
        turns = params['R']
        # L (scaled by 1e-3) is length in UI
        length = params['L'] * 1000.0
        if length <= 0.0:
            length = 0.5
            
        u0 = 4.0 * math.pi * 1e-7
        B = u0 * (turns / length) * current
        
        V = current
        I = current
        Z = B * 1e4
        P = current * current * 2.0
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V,
            'P': P
        }
