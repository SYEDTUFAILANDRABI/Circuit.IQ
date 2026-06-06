from .base_experiment import BaseExperiment

class PhotoelectricExperiment(BaseExperiment):
    """Calculations for the Photoelectric Effect experiment."""
    
    EXP_TYPE = 'photoelectric'

    def calculate(self, params, button_pressed=True):
        freq = params['V']
        intensity = params['R']
        # L (scaled by 1e-3) is work function in eV in UI
        work = params['L'] * 1000.0
        
        h = 4.1357e-15
        freqHz = freq * 1e14
        photonEnergy = h * freqHz
        
        KE = 0.0
        stoppingV = 0.0
        if photonEnergy > work:
            KE = photonEnergy - work
            stoppingV = KE
            
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': work,
            'I': intensity,
            'phi': 0.0,
            'f0': KE,
            'V': freq,
            'P': stoppingV
        }
