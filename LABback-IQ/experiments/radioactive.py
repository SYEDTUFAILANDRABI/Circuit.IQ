import time
import math
from .base_experiment import BaseExperiment

class RadioactiveExperiment(BaseExperiment):
    """Calculations for the Radioactive Decay Half-Life experiment."""
    
    EXP_TYPE = 'radioactive'

    def calculate(self, params, button_pressed=True):
        N0 = params['V']
        halfLife = params['R']
        
        # Use modulo 60 to mimic cyclic time plot in frontend
        t = time.time() % 60.0
        
        lambda_val = math.log(2.0) / halfLife if halfLife > 0.0 else 1.0
        N = N0 * math.exp(-lambda_val * t)
        decay_rate = lambda_val * N
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': halfLife,
            'I': N,
            'phi': 0.0,
            'f0': 0.0,
            'V': N0,
            'P': decay_rate
        }
