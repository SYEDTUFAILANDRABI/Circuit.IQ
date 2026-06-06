from .base_experiment import BaseExperiment

class TransformerExperiment(BaseExperiment):
    """Calculations for the AC Transformer Ratio experiment."""
    
    EXP_TYPE = 'transformer'

    def calculate(self, params, button_pressed=True):
        Vp = params['V']
        Np = params['R']
        # L (scaled by 1e-3) is secondary turns Ns in UI
        Ns = params['L'] * 1000.0
        
        ratio = Ns / Np if Np > 0.0 else 1.0
        V_out = Vp * ratio
        I = V_out / 100.0
        Z = ratio
        P = V_out * I
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V_out,
            'P': P
        }
