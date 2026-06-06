from .base_experiment import BaseExperiment

class KvlExperiment(BaseExperiment):
    """Calculations for the KVL (Kirchhoff's Voltage Law) experiment."""
    
    EXP_TYPE = 'kvl'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R = params['R_eff']
        
        Z = R
        I = V / R if R > 0.0 else 0.0
        P = V * I
        
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
