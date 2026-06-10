"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: test_physics.py
 ROLE: Unit Tests — Verifies physics_engine.py calculations
================================================================================
 HOW TO RUN:
    python test_physics.py
    (or: python -m pytest test_physics.py -v)

 TESTS COVERED:
    TestPhysicsEngine.test_ohms_law         → I = V/R at room temperature
    TestPhysicsEngine.test_temperature_effect → R_eff = R × (1 + α × ΔT)
    TestPhysicsEngine.test_lcr_series       → XL, XC, Z, I, f0 calculations
    TestPhysicsEngine.test_circuit_validator → Closed loop DFS topology check

 EXPECTED VALUES:
    Ohm's Law: R=100Ω, V=12V, T=25°C → I=0.12A, P=1.44W
    Temperature: R=100Ω, T=125°C → R_eff=139.3Ω (copper alpha=0.00393/°C)
    LCR at f=50Hz: f0=71.176Hz (theoretical resonance for L=50mH, C=100µF)
================================================================================
"""

import unittest
import math
from physics_engine import PhysicsEngine

class TestPhysicsEngine(unittest.TestCase):
    def setUp(self):
        self.engine = PhysicsEngine()

    def test_ohms_law(self):
        # Setup nominal parameters
        self.engine.set_param('R', 100.0)
        self.engine.set_param('V', 12.0)
        self.engine.set_param('T', 25.0) # Temperature = 25°C means Reff = 100.0
        
        res = self.engine.calculate('ohms')
        self.assertAlmostEqual(res['R_eff'], 100.0)
        self.assertAlmostEqual(res['I'], 0.12)
        self.assertAlmostEqual(res['P'], 1.44)

    def test_temperature_effect(self):
        # Temp = 125°C, R = 100.0, alpha = 0.00393
        # R_eff = 100 * (1 + 0.00393 * (125 - 25)) = 100 * (1 + 0.393) = 139.3
        self.engine.set_param('R', 100.0)
        self.engine.set_param('T', 125.0)
        self.engine.set_param('V', 12.0)
        
        res = self.engine.calculate('ohms')
        self.assertAlmostEqual(res['R_eff'], 139.3)
        self.assertAlmostEqual(res['I'], 12.0 / 139.3)

    def test_lcr_series(self):
        # L = 50mH (0.05 H), C = 100uF (0.0001 F), R = 100.0, f = 50.0
        # omega = 2 * pi * 50 = 314.15926
        # XL = 314.15926 * 0.05 = 15.70796
        # XC = 1 / (314.15926 * 0.0001) = 31.83098
        # X = XL - XC = -16.123
        # Z = sqrt(100^2 + X^2) = 101.29
        self.engine.set_param('R', 100.0)
        self.engine.set_param('L', 0.05)
        self.engine.set_param('C', 0.0001)
        self.engine.set_param('f', 50.0)
        self.engine.set_param('V', 12.0)
        self.engine.set_param('T', 25.0)

        res = self.engine.calculate('lcr')
        self.assertAlmostEqual(res['XL'], 2.0 * math.pi * 50.0 * 0.05)
        self.assertAlmostEqual(res['XC'], 1.0 / (2.0 * math.pi * 50.0 * 0.0001))
        
        # Resonance frequency f0 = 1 / (2 * pi * sqrt(L * C))
        # f0 = 1 / (2 * pi * sqrt(0.05 * 0.0001)) = 1 / (2 * pi * sqrt(5e-6)) = 1 / (2 * pi * 0.002236) = 71.176 Hz
        self.assertAlmostEqual(res['f0'], 71.17625, places=4)

    def test_boyles_law(self):
        # Set parameters that would normally affect calculations
        self.engine.set_param('V', 10.0) # Volume = 10 L
        self.engine.set_param('R', 500.0) # Temperature param set to 500 K in UI
        self.engine.set_param('L', 2.0 * 1e-3) # Moles param set to 2.0 in UI (moles are scaled by 1e-3 from UI to engine L)
        
        res = self.engine.calculate('boyle')
        # Temperature (Z) should be constant 300.0 K
        self.assertEqual(res['Z'], 300.0)
        # Moles (P) should be constant 1.0 mol
        self.assertEqual(res['P'], 1.0)
        # V (pressure) should be (1.0 * 8.314 * 300.0) / 10.0 = 249.42 kPa
        self.assertAlmostEqual(res['V'], 249.42)

    def test_kvl(self):
        # Vs = 12V, R1 = 50Ω, R2 = 50Ω (L = 0.05H)
        self.engine.set_param('V', 12.0)
        self.engine.set_param('R', 50.0)
        self.engine.set_param('L', 0.05) # L represents R2 in mH (so 50mH is 50Ω)
        self.engine.set_param('T', 25.0)

        res = self.engine.calculate('kvl')
        self.assertAlmostEqual(res['Z'], 100.0) # R1 + R2 = 100Ω
        self.assertAlmostEqual(res['I'], 0.12) # 12V / 100Ω = 0.12A
        self.assertAlmostEqual(res['VR1'], 6.0) # 0.12A * 50Ω = 6V
        self.assertAlmostEqual(res['VR2'], 6.0) # 0.12A * 50Ω = 6V
        self.assertAlmostEqual(res['P'], 1.44) # 12V * 0.12A = 1.44W

    def test_kcl(self):
        # Vs = 12V, R1 = 50Ω, R2 = 50Ω
        self.engine.set_param('V', 12.0)
        self.engine.set_param('R', 50.0)
        self.engine.set_param('L', 0.05)
        self.engine.set_param('T', 25.0)

        res = self.engine.calculate('kcl')
        self.assertAlmostEqual(res['Z'], 25.0) # 50 || 50 = 25Ω
        self.assertAlmostEqual(res['I'], 0.48) # 12V / 25Ω = 0.48A
        self.assertAlmostEqual(res['IR1'], 0.24) # 12V / 50Ω = 0.24A
        self.assertAlmostEqual(res['IR2'], 0.24) # 12V / 50Ω = 0.24A
        self.assertAlmostEqual(res['P'], 5.76) # 12V * 0.48A = 5.76W

    def test_series_parallel(self):
        # V = 12.0 V, R1 = 100.0, R2 = 0.1 H (which is 100mH, meaning 100Ω)
        self.engine.set_param('V', 12.0)
        self.engine.set_param('R', 100.0)
        self.engine.set_param('L', 0.1) # 100mH
        self.engine.set_param('T', 25.0)
        
        # Test series case
        self.engine.set_param('is_parallel', False)
        res = self.engine.calculate('series_parallel')
        self.assertAlmostEqual(res['Z'], 200.0)
        self.assertAlmostEqual(res['I'], 0.06)
        
        # Test parallel case
        self.engine.set_param('is_parallel', True)
        res_parallel = self.engine.calculate('series_parallel')
        self.assertAlmostEqual(res_parallel['Z'], 50.0)
        self.assertAlmostEqual(res_parallel['I'], 0.24)

    def test_circuit_validator(self):
        placed = [
            {'type': 'source', 'id': 0},
            {'type': 'resistor', 'id': 1}
        ]
        # Connection forming closed loop: source(0)-term0 -> resistor(1)-term0, resistor(1)-term1 -> source(0)-term1
        wires = [
            ((0, 0), (1, 0)),
            ((1, 1), (0, 1))
        ]
        is_valid, msg = self.engine.validate_circuit(placed, wires, ['source', 'resistor'])
        self.assertTrue(is_valid, msg)

        # Connection with missing components required
        is_valid, msg = self.engine.validate_circuit(placed, wires, ['source', 'resistor', 'inductor'])
        self.assertFalse(is_valid)

        # Incomplete connection (not closed)
        wires_incomplete = [
            ((0, 0), (1, 0))
        ]
        is_valid, msg = self.engine.validate_circuit(placed, wires_incomplete, ['source', 'resistor'])
        self.assertFalse(is_valid)

if __name__ == '__main__':
    unittest.main()
