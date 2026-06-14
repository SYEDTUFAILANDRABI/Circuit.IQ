from .base_experiment import BaseExperiment

class SeriesParallelExperiment(BaseExperiment):
    """Calculations for the Series & Parallel loads experiment."""
    
    EXP_TYPE = 'series_parallel'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R1 = params['R_eff']
        # The L parameter (scaled by 1e-3 in frontend mapping) is used as R2 in UI
        R2 = params['L'] * 1000.0
        
        is_parallel = params.get('is_parallel', False)
        if is_parallel:
            Z = (R1 * R2) / (R1 + R2) if (R1 + R2) > 0.0 else 0.0
            V_volt = V
        else:
            Z = R1 + R2
            V_volt = V * R1 / (R1 + R2) if (R1 + R2) > 0.0 else 0.0
            
        I = V / Z if Z > 0.0 else 0.0
        P = V * I
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V_volt,
            'P': P
        }
