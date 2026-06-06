from .base_experiment import BaseExperiment

class IdealGasExperiment(BaseExperiment):
    """Calculations for the Ideal Gas State Equation experiment."""
    
    EXP_TYPE = 'ideal_gas'

    def calculate(self, params, button_pressed=True):
        vol = params['V']
        temp = params['R']
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
