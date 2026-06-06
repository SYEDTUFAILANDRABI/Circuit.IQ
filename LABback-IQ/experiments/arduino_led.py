from .base_experiment import BaseExperiment

class ArduinoLedExperiment(BaseExperiment):
    """Calculations for the Arduino LED Control experiment."""
    
    EXP_TYPE = 'arduino_led'

    def calculate(self, params, button_pressed=True):
        V = params['V']
        R_eff = params['R_eff']
        
        Z = R_eff
        I = V / R_eff if R_eff > 0.0 else 0.0
        P = V * I
        
        return {
            'XL': 0.0,
            'XC': 0.0,
            'Z': Z,
            'I': I,
            'phi': 0.0,
            'f0': 0.0,
            'V': V,
            'P': P
        }
