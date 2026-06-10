from .base_experiment import BaseExperiment

class KclExperiment(BaseExperiment):
    """Calculations for the KCL (Kirchhoff's Current Law) experiment.
    
    KCL uses two resistors in parallel. R1 comes from params['R_eff'],
    R2 comes from params['L'] (reused slider, converted back from Henries to Ohms).
    Verifies: I_total = I_R1 + I_R2
    """
    
    EXP_TYPE = 'kcl'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R1 = params['R_eff']
        R2_nominal = params['L'] * 1000.0
        alpha = 0.00393
        T = params['T']
        R2 = R2_nominal * (1.0 + alpha * (T - 25.0))
        
        if R1 > 0.0 or R2 > 0.0:
            if R1 == 0.0 or R2 == 0.0:
                Z = 0.0
            else:
                Z = (R1 * R2) / (R1 + R2)
        else:
            Z = 0.0
            
        I = V / Z if Z > 0.0 else 0.0
        IR1 = V / R1 if R1 > 0.0 else 0.0
        IR2 = V / R2 if R2 > 0.0 else 0.0
        P = V * I
        
        return {
            'XL': IR1,   # Pass branch 1 current for compatibility
            'XC': IR2,   # Pass branch 2 current for compatibility
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V,
            'IR1': IR1,
            'IR2': IR2,
            'P': P
        }
