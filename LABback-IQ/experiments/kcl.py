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
        # L slider is reused as R2 in the frontend (sent as mH, so multiply by 1000 to get Ohms)
        R2 = params.get('L', 0.1) * 1000.0
        if R2 <= 0:
            R2 = 100.0
        
        # Parallel equivalent resistance
        Z = (R1 * R2) / (R1 + R2) if (R1 + R2) > 0.0 else 0.0
        I = V / Z if Z > 0.0 else 0.0  # Total current before junction
        P = V * I
        
        # Branch currents
        I_R1 = V / R1 if R1 > 0.0 else 0.0
        I_R2 = V / R2 if R2 > 0.0 else 0.0
        
        return {
            'XL': I_R1,   # Pass I_branch1 through XL field
            'XC': I_R2,   # Pass I_branch2 through XC field
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V,
            'P': P
        }
