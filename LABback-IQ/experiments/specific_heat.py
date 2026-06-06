from .base_experiment import BaseExperiment

class SpecificHeatExperiment(BaseExperiment):
    """Calculations for the Specific Heat Capacity experiment."""
    
    EXP_TYPE = 'specific_heat'

    def calculate(self, params, button_pressed=True):
        mm = params['V']
        Tm = params['R']
        # L (scaled by 1e-3) is water mass mw in UI
        mw = params['L'] * 1000.0
        Tw = 25.0
        
        # Specific heat values: cm (copper) = 0.385, cw (water) = 4.184
        cm = 0.385
        cw = 4.184
        
        denominator = mm * cm + mw * cw
        Tf = (mm * cm * Tm + mw * cw * Tw) / denominator if denominator > 0.0 else Tw
        heat_lost = mm * cm * (Tm - Tf)
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Tf,
            'I': Tw,
            'phi': 0.0,
            'f0': 0.0,
            'V': Tm,
            'P': heat_lost
        }
