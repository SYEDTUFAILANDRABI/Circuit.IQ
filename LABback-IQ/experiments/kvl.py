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
        # L slider is reused as R2 in the frontend (sent as mH, so multiply by 1000 to get Ohms)
        R2 = params.get('L', 0.1) * 1000.0
        if R2 <= 0:
            R2 = 100.0
        
        Z = R1 + R2  # Series total resistance
        I = V / Z if Z > 0.0 else 0.0
        P = V * I
        
        # Individual voltage drops
        V_R1 = I * R1
        V_R2 = I * R2
        
        return {
            'XL': V_R1,   # Pass V_R1 through XL field
            'XC': V_R2,   # Pass V_R2 through XC field
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': R1,     # Pass R1 value through f0 field
            'V': V,
            'P': P
        }
