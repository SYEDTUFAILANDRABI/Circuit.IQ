from .base_experiment import BaseExperiment

class WheatstoneExperiment(BaseExperiment):
    """Calculations for the Wheatstone Bridge Balance experiment."""
    
    EXP_TYPE = 'wheatstone'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R1 = params['R_eff']
        # L (scaled by 1e-3) is R2 in UI
        R2 = params['L'] * 1000.0
        # C (scaled by 1e-6) is R3 in UI
        R3 = params['C'] * 1000000.0
        R4 = 150.0
        
        balancedR3 = R4 * R1 / R2 if R2 > 0.0 else 0.0
        Z = R1 + R2 + R3 + R4
        I = abs(R3 - balancedR3) * 0.0001
        P = V * I
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': balancedR3,
            'V': V,
            'P': P
        }
