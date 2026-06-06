from .base_experiment import BaseExperiment

class DeBroglieExperiment(BaseExperiment):
    """Calculations for the de Broglie matter wave experiment."""
    
    EXP_TYPE = 'de_broglie'

    def calculate(self, params, button_pressed=True):
        mass_ui = params['V']
        vel_ui = params['R']
        
        # Physical scaling matching frontend
        mass = mass_ui * 1e-30
        vel = vel_ui * 1e3
        h = 6.626e-34
        
        denominator = mass * vel
        wavelength = h / denominator if denominator > 0.0 else 0.0
        wavelength_nm = wavelength * 1e9
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': wavelength_nm,
            'I': vel_ui,
            'phi': 0.0,
            'f0': 0.0,
            'V': mass_ui,
            'P': 0.0
        }
