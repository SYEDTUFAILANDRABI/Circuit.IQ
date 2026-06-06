from .base_experiment import BaseExperiment

class BohrModelExperiment(BaseExperiment):
    """Calculations for the Bohr Hydrogen atom transitions experiment."""
    
    EXP_TYPE = 'bohr_model'

    def calculate(self, params, button_pressed=True):
        ni = params['V']
        nf = params['R']
        
        Ei = -13.6 / (ni * ni) if ni > 0.0 else -13.6
        Ef = -13.6 / (nf * nf) if nf > 0.0 else -13.6
        deltaE = abs(Ei - Ef)
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': deltaE,
            'I': nf,
            'phi': 0.0,
            'f0': 0.0,
            'V': ni,
            'P': 0.0
        }
