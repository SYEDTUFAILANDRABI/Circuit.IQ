from .base_experiment import BaseExperiment

class CharlesExperiment(BaseExperiment):
    """Calculations for the Charles's Constant Pres Law experiment."""
    
    EXP_TYPE = 'charles'

    def calculate(self, params, button_pressed=True):
        # In Charles's Law, params.V is used to map both vol and temp
        vol = params['V'] * 0.03
        temp = params['V']
        # L (scaled by 1e-3) is moles in UI
        moles = params['L'] * 1000.0
        
        Rg = 8.314
        pressure = (moles * Rg * temp) / vol if vol > 0.0 else 0.0
        internal_energy = 1.5 * moles * Rg * temp
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': temp,
            'I': vol,
            'phi': 0.0,
            'f0': internal_energy,
            'V': pressure,
            'P': moles
        }
