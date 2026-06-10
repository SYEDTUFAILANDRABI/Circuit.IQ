from .base_experiment import BaseExperiment

class KvlExperiment(BaseExperiment):
    """Calculations for the KVL (Kirchhoff's Voltage Law) experiment.
    
    KVL uses two resistors in series. R1 comes from params['R_eff'],
    R2 comes from params['L'] (reused slider, converted back from Henries to Ohms).
    Verifies: V_source - V_R1 - V_R2 = 0
    """
    
    EXP_TYPE = 'kvl'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R1 = params['R_eff']
        R2_nominal = params['L'] * 1000.0
        alpha = 0.00393
        T = params['T']
        R2 = R2_nominal * (1.0 + alpha * (T - 25.0))
        
        Z = R1 + R2
        I = V / Z if Z > 0.0 else 0.0
        
        VR1 = I * R1
        VR2 = I * R2
        P = V * I
        
        return {
            'XL': VR1,   # Pass V_R1 through XL field for compatibility
            'XC': VR2,   # Pass V_R2 through XC field for compatibility
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': R1,     # Pass R1 value through f0 field for compatibility
            'V': V,
            'VR1': VR1,
            'VR2': VR2,
            'P': P
        }
