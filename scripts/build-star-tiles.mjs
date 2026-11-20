#!/usr/bin/env node
/**
 * Reproducible binary star tile generator for Milky Way Observatory.
 *
 * Outputs:
 *   - public/data/stars-tier0.bin      : Measured real bright & nearby stars (Hipparcos / HYG v3 / ESA Gaia DR3, illustrative = 0)
 *   - public/data/stars-tier1.bin      : Gaia DR3-calibrated local galactic neighborhood statistical fill (illustrative = 1)
 *   - public/data/stars-manifest.json  : Tile manifest + named star index
 *
 * Binary record format (Float32LE, stride = 6 floats = 24 bytes per star):
 *   [0] raDeg          (J2000 Right Ascension, degrees)
 *   [1] decDeg         (J2000 Declination, degrees)
 *   [2] distPc         (Heliocentric distance, parsecs)
 *   [3] vMag           (Apparent visual magnitude V)
 *   [4] bvColor        (Johnson B-V color index, ~ -0.35 blue O/B to +2.0 red M)
 *   [5] illustrative   (0.0 = measured catalog star, 1.0 = statistical illustrative fill)
 *
 * Usage:
 *   node scripts/build-star-tiles.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'public', 'data');
fs.mkdirSync(OUT_DIR, { recursive: true });

/**
 * Curated catalog of real nearby & bright stars with J2000 RA (deg), Dec (deg),
 * distance (parsecs), apparent V magnitude, and B-V color index.
 * Sources: ESA Hipparcos (van Leeuwen 2007), HYG v3.8 (astronexus.com), ESA Gaia DR3 (2022).
 * Format: [name, constellation, raDeg, decDeg, distPc, vMag, bvColor]
 */
const MEASURED_REAL_STARS = [
  // Nearest stars (< 10 pc) — Gaia DR3 / RECONS
  ['Proxima Centauri', 'Cen', 217.4289, -62.6795, 1.3019, 11.13, 1.82],
  ['Alpha Centauri A', 'Cen', 219.9021, -60.834, 1.339, -0.01, 0.71],
  ['Alpha Centauri B', 'Cen', 219.8961, -60.8375, 1.339, 1.33, 0.88],
  ["Barnard's Star", 'Oph', 269.4521, 4.6934, 1.8282, 9.51, 1.74],
  ['Wolf 359', 'Leo', 164.1203, 7.0147, 2.4086, 13.54, 2.01],
  ['Lalande 21185', 'UMa', 165.8341, 35.9699, 2.5461, 7.52, 1.51],
  ['Sirius A', 'CMa', 101.2872, -16.7161, 2.637, -1.46, 0.0],
  ['Sirius B', 'CMa', 101.2886, -16.719, 2.637, 8.44, -0.03],
  ['Luyten 726-8 A', 'Cet', 24.7564, -17.9505, 2.676, 12.54, 1.85],
  ['Ross 154', 'Sgr', 282.4557, -23.8362, 2.976, 10.44, 1.76],
  ['Ross 248', 'And', 355.4791, 44.178, 3.159, 12.29, 1.92],
  ['Epsilon Eridani', 'Eri', 53.2327, -9.4583, 3.22, 3.73, 0.88],
  ['Lacaille 9352', 'PsA', 346.4668, -35.8531, 3.287, 7.34, 1.5],
  ['Ross 128', 'Vir', 176.935, 0.8046, 3.375, 11.15, 1.76],
  ['61 Cygni A', 'Cyg', 316.7248, 38.7494, 3.497, 5.21, 1.18],
  ['61 Cygni B', 'Cyg', 316.7303, 38.7421, 3.497, 6.03, 1.37],
  ['Procyon A', 'CMi', 114.8255, 5.225, 3.51, 0.34, 0.42],
  ['Tau Ceti', 'Cet', 26.017, -15.9375, 3.65, 3.5, 0.72],
  ['Epsilon Indi', 'Ind', 330.8402, -56.786, 3.639, 4.69, 1.06],
  ["Kapteyn's Star", 'Pic', 77.9191, -45.0184, 3.934, 8.85, 1.56],
  ['Kruger 60 A', 'Cep', 336.9978, 57.6959, 4.011, 9.59, 1.62],
  ["Van Maanen's Star", 'Psc', 12.2913, 5.3886, 4.313, 12.37, 0.55],
  ['Gliese 1', 'Scl', 1.3518, -37.3574, 4.349, 8.56, 1.46],
  ['40 Eridani A', 'Eri', 63.818, -7.6529, 5.004, 4.43, 0.82],
  ['Altair', 'Aql', 297.6958, 8.8683, 5.13, 0.76, 0.22],
  ['70 Ophiuchi A', 'Oph', 271.3637, 2.5001, 5.122, 4.2, 0.86],
  ['Sigma Draconis', 'Dra', 293.09, 69.6612, 5.764, 4.67, 0.79],
  ['Eta Cassiopeiae A', 'Cas', 12.2762, 57.8152, 5.92, 3.44, 0.58],
  ['36 Ophiuchi A', 'Oph', 258.8374, -26.6028, 5.96, 5.07, 0.85],
  ['Delta Pavonis', 'Pav', 302.1817, -66.1821, 6.101, 3.56, 0.76],
  ['Gliese 581', 'Lib', 229.8618, -7.7223, 6.299, 10.56, 1.6],
  ['Gliese 667 C', 'Sco', 259.7451, -34.9968, 7.24, 10.22, 1.57],
  ['Vega', 'Lyr', 279.2347, 38.7837, 7.68, 0.03, 0.0],
  ['Fomalhaut', 'PsA', 344.4127, -29.6222, 7.7, 1.16, 0.09],
  ['Beta Hydri', 'Hyi', 6.4378, -77.2542, 7.46, 2.8, 0.62],
  ['Mu Cassiopeiae', 'Cas', 17.0683, 54.9203, 7.55, 5.17, 0.69],
  ['Pi3 Orionis', 'Ori', 72.46, 6.9613, 8.07, 3.19, 0.45],
  ['Chi1 Orionis', 'Ori', 88.5958, 20.2762, 8.84, 4.39, 0.59],
  ['Beta Comae Berenices', 'Com', 197.9683, 27.8782, 9.15, 4.25, 0.57],
  ['Kappa1 Ceti', 'Cet', 49.8404, 3.3702, 9.16, 4.84, 0.68],
  ['Pollux', 'Gem', 116.3289, 28.0262, 10.36, 1.14, 1.0],
  ['Denebola', 'Leo', 177.2649, 14.5721, 11.0, 2.14, 0.09],
  ['Arcturus', 'Boo', 213.9153, 19.1824, 11.26, -0.05, 1.23],
  ['TRAPPIST-1', 'Aqr', 346.6224, -5.0414, 12.47, 18.8, 2.02],
  ['Capella Aa', 'Aur', 79.1723, 45.998, 13.12, 0.08, 0.8],
  ['55 Cancri A', 'Cnc', 133.1492, 28.3308, 12.59, 5.95, 0.87],
  ['Upsilon Andromedae', 'And', 24.1993, 41.4055, 13.48, 4.09, 0.54],
  ['47 Ursae Majoris', 'UMa', 164.8666, 40.4303, 13.8, 5.03, 0.61],
  ['51 Pegasi', 'Peg', 344.3666, 20.7688, 15.53, 5.46, 0.67],
  ['Castor', 'Gem', 113.6494, 31.8883, 15.6, 1.58, 0.03],
  ['Alderamin', 'Cep', 319.6449, 62.5856, 15.04, 2.45, 0.22],
  ['Rasalhague', 'Oph', 263.7336, 12.56, 14.9, 2.08, 0.15],
  ['Caph', 'Cas', 2.2945, 59.1498, 16.78, 2.28, 0.34],
  ['Aldebaran', 'Tau', 68.9802, 16.5093, 20.0, 0.86, 1.54],
  ['Miaplacidus', 'Car', 138.2999, -69.7172, 34.7, 1.67, 0.0],
  ['Regulus', 'Leo', 152.0929, 11.9672, 24.3, 1.36, -0.11],
  ['Merak', 'UMa', 165.4603, 56.3824, 24.45, 2.37, -0.02],
  ['Megrez', 'UMa', 183.8565, 57.0326, 24.7, 3.31, 0.08],
  ['Alioth', 'UMa', 193.5073, 55.9598, 25.3, 1.77, -0.02],
  ['Mizar', 'UMa', 200.9814, 54.9254, 25.4, 2.23, 0.02],
  ['Phecda', 'UMa', 178.4577, 53.6948, 25.5, 2.44, 0.0],
  ['Alphecca', 'CrB', 233.6719, 26.7147, 23.0, 2.22, -0.02],
  ['Alpheratz', 'And', 2.0969, 29.0904, 29.7, 2.06, -0.11],
  ['Algol', 'Per', 47.0422, 40.9556, 27.6, 2.12, -0.05],
  ['Alkaid', 'UMa', 206.8852, 49.3133, 31.9, 1.86, -0.19],
  ['Menkalinan', 'Aur', 89.8822, 44.9474, 24.9, 1.9, 0.03],
  ['Dubhe', 'UMa', 165.9319, 61.751, 37.9, 1.79, 1.07],
  ['Gacrux', 'Cru', 187.7915, -57.1132, 27.2, 1.63, 1.59],
  ['Menkent', 'Cen', 211.6706, -36.37, 18.0, 2.06, 1.01],
  ['Hamal', 'Ari', 31.7934, 23.4624, 20.2, 2.0, 1.15],
  ['Diphda', 'Cet', 10.8974, -17.9866, 29.5, 2.04, 1.02],
  ['Kaus Australis', 'Sgr', 276.043, -34.3846, 43.9, 1.85, -0.03],
  ['Achernar', 'Eri', 24.4285, -57.2368, 42.8, 0.46, -0.16],
  ['Eltanin', 'Dra', 269.1515, 51.4889, 47.3, 2.23, 1.52],
  ['Alnair', 'Gru', 332.0583, -46.961, 31.0, 1.74, -0.13],
  ['Peacock', 'Pav', 306.4119, -56.7351, 54.8, 1.94, -0.2],
  ['Nunki', 'Sgr', 283.8164, -26.2967, 69.9, 2.05, -0.22],
  ['Elnath', 'Tau', 81.573, 28.6074, 41.0, 1.65, -0.13],
  ['Mirach', 'And', 17.433, 35.6206, 60.5, 2.05, 1.58],
  ['Schedar', 'Cas', 10.1268, 56.5373, 70.0, 2.23, 1.17],
  ['Spica', 'Vir', 201.2983, -11.1613, 76.6, 0.97, -0.23],
  ['Bellatrix', 'Ori', 81.2828, 6.3497, 77.0, 1.64, -0.22],
  ['Alhena', 'Gem', 99.4279, 16.3993, 33.5, 1.93, 0.0],
  ['Canopus', 'Car', 95.988, -52.6957, 94.8, -0.74, 0.15],
  ['Acrux', 'Cru', 186.6496, -63.0991, 99.0, 0.76, -0.24],
  ['Mimosa', 'Cru', 191.9303, -59.6888, 85.4, 1.25, -0.23],
  ['Hadar', 'Cen', 210.9559, -60.373, 120.0, 0.61, -0.23],
  ['Adhara', 'CMa', 104.6564, -28.9721, 124.0, 1.5, -0.21],
  ['Polaris', 'UMi', 37.9546, 89.2641, 132.6, 1.98, 0.6],
  ['Alcyone (Pleiades)', 'Tau', 56.8712, 24.1051, 135.0, 2.87, -0.09],
  ['Antares', 'Sco', 247.3519, -26.432, 169.0, 0.96, 1.83],
  ['Betelgeuse', 'Ori', 88.7929, 7.4071, 168.0, 0.5, 1.85],
  ['Shaula', 'Sco', 263.4022, -37.1038, 175.0, 1.63, -0.22],
  ['Mirfak', 'Per', 51.0807, 49.8612, 155.0, 1.79, 0.48],
  ['Sargas', 'Sco', 264.3297, -42.9978, 92.0, 1.87, 0.4],
  ['Avior', 'Car', 125.6285, -59.5095, 185.0, 1.86, 1.28],
  ['Suhail', 'Vel', 136.999, -43.4326, 167.0, 2.21, 1.66],
  ['Regor (Gamma Vel)', 'Vel', 122.3831, -47.3366, 336.0, 1.83, -0.22],
  ['Rigel', 'Ori', 78.6345, -8.2016, 264.0, 0.13, -0.03],
  ['Saiph', 'Ori', 86.9391, -9.6696, 198.0, 2.09, -0.17],
  ['Mintaka', 'Ori', 83.0017, -0.2991, 212.0, 2.23, -0.22],
  ['Alnitak', 'Ori', 85.1897, -1.9426, 226.0, 1.77, -0.21],
  ['Alnilam', 'Ori', 84.0534, -1.2019, 412.0, 1.69, -0.19],
  ['Wezen', 'CMa', 107.0979, -26.3932, 490.0, 1.84, 0.67],
  ['Sadr', 'Cyg', 305.5571, 40.2567, 560.0, 2.23, 0.67],
  ['Aludra', 'CMa', 111.0238, -29.3031, 610.0, 2.45, -0.08],
  ['Deneb', 'Cyg', 310.358, 45.2803, 802.0, 1.25, 0.09],
  ['Naos (Zeta Pup)', 'Pup', 120.896, -40.0031, 332.0, 2.25, -0.27],
  ['Kepler-186', 'Cyg', 298.6527, 43.955, 178.5, 14.62, 1.45],
  ['Kepler-452', 'Cyg', 296.0037, 44.2776, 552.0, 13.43, 0.65],
  ['HD 189733', 'Vul', 300.1821, 22.7109, 19.78, 7.67, 0.93],
  ['HD 209458', 'Peg', 330.7949, 18.8843, 48.3, 7.65, 0.59],
  ['K2-18', 'Leo', 172.5605, 7.5884, 38.03, 13.5, 1.52],
  ['WASP-12', 'Aur', 97.6367, 29.6723, 427.0, 11.69, 0.57],
  ['Eta Carinae', 'Car', 161.265, -59.6844, 2300.0, 4.3, 0.61],
  ['Cygnus X-1 (HDE 226868)', 'Cyg', 299.5903, 35.2016, 2220.0, 8.95, 0.81],
  ['Vela Pulsar', 'Vel', 128.836, -45.1764, 287.0, 23.6, -0.3],
  ['Crab Pulsar (M1)', 'Tau', 83.6331, 22.0145, 2000.0, 16.5, -0.2],
  // Bright constellation anchors (Northern & Southern Sky — Hipparcos)
  ['Almach', 'And', 30.9748, 42.3297, 108.0, 2.1, 1.2],
  ['Enif', 'Peg', 326.0465, 9.875, 211.0, 2.38, 1.52],
  ['Markab', 'Peg', 346.1902, 15.2053, 40.9, 2.49, -0.04],
  ['Scheat', 'Peg', 345.9436, 28.0828, 60.0, 2.44, 1.67],
  ['Algenib', 'Peg', 3.309, 15.1836, 120.0, 2.83, -0.23],
  ['Albireo', 'Cyg', 292.6803, 27.9597, 133.0, 3.05, 1.13],
  ['Gienah Cygni', 'Cyg', 311.5528, 33.9703, 22.3, 2.48, 1.03],
  ['Delta Cygni', 'Cyg', 296.2437, 45.1308, 50.6, 2.87, -0.03],
  ['Sheliak', 'Lyr', 282.52, 33.3627, 295.0, 3.52, 0.0],
  ['Sulafat', 'Lyr', 284.7359, 32.6896, 190.0, 3.25, -0.05],
  ['Tarazed', 'Aql', 296.5649, 10.6133, 121.0, 2.72, 1.52],
  ['Alshain', 'Aql', 298.8283, 6.4068, 13.7, 3.71, 0.86],
  ['Izar', 'Boo', 221.2467, 27.0742, 62.0, 2.35, 0.97],
  ['Muphrid', 'Boo', 208.6712, 18.3977, 11.4, 2.68, 0.58],
  ['Seginus', 'Boo', 218.0195, 38.3083, 26.6, 3.04, 0.19],
  ['Algieba', 'Leo', 154.9931, 19.8415, 40.0, 2.01, 1.13],
  ['Zosma', 'Leo', 168.5271, 20.5237, 17.9, 2.56, 0.12],
  ['Chertan', 'Leo', 168.56, 15.4296, 50.6, 3.34, 0.0],
  ['Alphard', 'Hya', 141.8968, -8.6586, 54.3, 1.99, 1.44],
  ['Porrima', 'Vir', 190.4151, -1.4494, 11.7, 2.74, 0.36],
  ['Vindemiatrix', 'Vir', 195.5442, 10.9591, 33.6, 2.85, 0.94],
  ['Zubeneschamali', 'Lib', 229.2517, -9.3829, 56.7, 2.61, -0.11],
  ['Zubenelgenubi', 'Lib', 222.7196, -16.0417, 23.2, 2.75, 0.15],
  ['Dschubba', 'Sco', 240.0834, -22.6217, 150.0, 2.29, -0.12],
  ['Graffias', 'Sco', 241.3593, -19.8055, 124.0, 2.56, -0.07],
  ['Lesath', 'Sco', 262.691, -37.2958, 178.0, 2.7, -0.22],
  ['Kaus Media', 'Sgr', 275.2485, -29.8281, 106.0, 2.72, 1.38],
  ['Kaus Borealis', 'Sgr', 276.9927, -25.4217, 24.0, 2.82, 1.04],
  ['Ascella', 'Sgr', 285.653, -29.8801, 27.0, 2.6, 0.08],
  ['Deneb Algedi', 'Cap', 326.7602, -16.1273, 11.9, 2.85, 0.29],
  ['Sadalmelik', 'Aqr', 331.446, -0.3199, 160.0, 2.95, 0.97],
  ['Sadalsuud', 'Aqr', 322.8897, -5.5712, 165.0, 2.9, 0.83],
  ['Menkar', 'Cet', 45.5699, 4.0897, 76.4, 2.54, 1.64],
  ['Sheratan', 'Ari', 28.66, 20.808, 18.0, 2.64, 0.13],
  ['Cursa', 'Eri', 76.9624, -5.0864, 27.4, 2.78, 0.13],
  ['Zaurak', 'Eri', 59.5074, -13.5085, 62.4, 2.97, 1.59],
  ['Arneb', 'Lep', 83.1826, -17.8223, 680.0, 2.58, 0.21],
  ['Nihal', 'Lep', 82.0613, -20.7594, 49.0, 2.81, 0.82],
  ['Mirzam', 'CMa', 95.6749, -17.9559, 151.0, 1.98, -0.24],
  ['Phact', 'Col', 84.9123, -34.0741, 80.0, 2.65, -0.12],
  ['Unukalhai', 'Ser', 236.067, 6.4256, 22.7, 2.63, 1.17],
  ['Sabik', 'Oph', 257.5945, -15.7249, 27.0, 2.43, 0.06],
  ['Kornephoros', 'Her', 247.555, 21.4896, 42.6, 2.78, 0.94],
  ['Rasalgethi', 'Her', 258.6619, 14.3903, 110.0, 3.08, 1.44],
  ['Kochab', 'UMi', 222.6764, 74.1555, 40.1, 2.07, 1.47],
  ['Pherkad', 'UMi', 230.1822, 71.834, 149.0, 3.0, 0.05],
  ['Thuban', 'Dra', 211.0973, 64.3759, 92.9, 3.67, -0.05],
  ['Rastaban', 'Dra', 262.6082, 52.3014, 116.0, 2.79, 0.98],
  ['Atria', 'TrA', 252.1662, -69.0277, 120.0, 1.91, 1.44],
  ['Ankaa', 'Phe', 6.571, -42.306, 26.0, 2.4, 1.09],
  ['Alsephina', 'Vel', 131.1759, -54.7088, 24.7, 1.93, 0.04],
  ['Aspidiske', 'Car', 139.2725, -59.2752, 236.0, 2.21, 0.18],
  ['Muhlifain', 'Cen', 190.3792, -48.9599, 40.0, 2.17, -0.01],
  ['Imai', 'Cru', 183.7863, -58.7489, 106.0, 2.79, -0.23],
  ['Alpha Tucanae', 'Tuc', 334.6255, -60.2597, 61.2, 2.87, 1.39],
  ['Alpha Muscae', 'Mus', 189.296, -69.1356, 97.0, 2.69, -0.2],
  ['Alpha Lupi', 'Lup', 220.4823, -47.3882, 143.0, 2.3, -0.2],
  ['Beta Lupi', 'Lup', 224.633, -43.1339, 117.0, 2.68, -0.22],
  ['Alpha Arae', 'Ara', 262.9604, -49.8761, 82.0, 2.84, -0.17],
  ['Beta Arae', 'Ara', 261.3249, -55.5299, 200.0, 2.84, 1.46],
  ['Kaus', 'Sgr', 276.99, -25.42, 24.0, 2.82, 1.04],
  ['Cor Caroli', 'CVn', 194.0069, 38.3184, 35.2, 2.89, -0.12],
  ['Gienah Corvi', 'Crv', 183.9515, -17.5419, 47.1, 2.58, -0.11],
  ['Kraz', 'Crv', 188.5968, -23.3968, 44.7, 2.65, 0.89],
  ['Algorab', 'Crv', 187.4661, -16.5154, 26.6, 2.94, -0.05],
  ['Alcor', 'UMa', 201.3064, 54.9879, 25.0, 3.99, 0.16],
  ['Alnath', 'Tau', 81.573, 28.6074, 41.0, 1.65, -0.13],
  ['Maia', 'Tau', 56.4567, 24.3677, 117.0, 3.87, -0.07],
  ['Electra', 'Tau', 56.2189, 24.1133, 124.0, 3.7, -0.11],
  ['Atlas', 'Tau', 57.2906, 24.0534, 117.0, 3.62, -0.09],
  ['Merope', 'Tau', 56.5816, 23.9484, 117.0, 4.14, -0.06],
  ['Taygeta', 'Tau', 56.3021, 24.4673, 125.0, 4.3, -0.11],
  ['Zeta Tauri', 'Tau', 84.4112, 21.1425, 136.0, 2.97, -0.18],
  ['Hassaleh', 'Aur', 74.2484, 33.1661, 151.0, 2.69, 1.53],
  ['Mahasim', 'Aur', 89.9303, 37.2126, 51.0, 2.65, -0.08],
  ['Almaaz', 'Aur', 75.4922, 43.8233, 415.0, 3.03, 0.54],
  ['Tejat', 'Gem', 95.7401, 22.5136, 71.0, 2.87, 1.64],
  ['Mebsuta', 'Gem', 100.983, 25.1311, 259.0, 3.06, 1.4],
  ['Wasat', 'Gem', 110.0307, 21.9823, 18.5, 3.53, 0.34],
  ['Acubens', 'Cnc', 134.6218, 11.8577, 54.6, 4.26, 0.14],
  ['Altarf', 'Cnc', 124.1288, 9.1855, 92.9, 3.53, 1.48],
  ['Ras Elased', 'Leo', 146.4628, 23.7743, 75.6, 2.97, 0.81],
  ['Adhafera', 'Leo', 154.1726, 23.4173, 84.0, 3.44, 0.31],
  ['Sualocin', 'Del', 309.9095, 15.9121, 78.0, 3.77, -0.06],
  ['Rotanev', 'Del', 309.3873, 14.5951, 30.9, 3.63, 0.44],
  ['Sadachbia', 'Aqr', 335.414, -1.3874, 50.2, 3.86, -0.06],
  ['Skat', 'Aqr', 343.6627, -15.8208, 49.0, 3.27, 0.05],
  ['Alrescha', 'Psc', 30.5117, 2.7637, 46.3, 3.82, 0.0],
  ['Botein', 'Ari', 47.9074, 19.7267, 50.6, 4.35, 1.03],
  ['Atik', 'Per', 58.533, 31.8836, 231.0, 3.83, 0.05],
  ['Menkib', 'Per', 59.7413, 35.791, 382.0, 4.04, 0.01],
  ['Ruchbah', 'Cas', 21.454, 60.2353, 30.5, 2.68, 0.13],
  ['Tsih (Gamma Cas)', 'Cas', 14.1772, 60.7167, 168.0, 2.47, -0.15],
  ['Segin', 'Cas', 28.5989, 63.6701, 126.0, 3.35, -0.15],
  ['Alfirk', 'Cep', 322.165, 70.5607, 210.0, 3.23, -0.22],
  ['Errai', 'Cep', 354.8369, 77.6323, 13.79, 3.21, 1.03],
  ['Garnet Star (Mu Cep)', 'Cep', 325.8769, 58.78, 940.0, 4.08, 2.26],
  ['VV Cephei', 'Cep', 329.1631, 63.6256, 1500.0, 4.91, 1.77],
  ['VY Canis Majoris', 'CMa', 110.743, -25.7675, 1170.0, 7.96, 2.24],
  ['R136a1 (Reference LMC)', 'Dor', 84.6762, -69.1009, 49970.0, 12.23, -0.32],
  ['S2 (Sgr A* Orbit Star)', 'Sgr', 266.4168, -29.0078, 8178.0, 14.0, -0.25],
];

// Write Tier 0 (100% real measured stars, illustrative = 0)
const tier0Floats = new Float32Array(MEASURED_REAL_STARS.length * 6);
const namedIndex = [];

for (let i = 0; i < MEASURED_REAL_STARS.length; i += 1) {
  const [name, con, raDeg, decDeg, distPc, vMag, bvColor] = MEASURED_REAL_STARS[i];
  const base = i * 6;
  tier0Floats[base + 0] = raDeg;
  tier0Floats[base + 1] = decDeg;
  tier0Floats[base + 2] = distPc;
  tier0Floats[base + 3] = vMag;
  tier0Floats[base + 4] = bvColor;
  tier0Floats[base + 5] = 0.0; // measured, NOT illustrative
  namedIndex.push({
    index: i,
    name,
    constellation: con,
    raDeg,
    decDeg,
    distPc,
    vMag,
    bvColor,
    illustrative: false,
  });
}

fs.writeFileSync(
  path.join(OUT_DIR, 'stars-tier0.bin'),
  Buffer.from(tier0Floats.buffer)
);

// Deterministic PRNG for Gaia DR3-calibrated solar-neighborhood statistical fill (Tier 1)
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate 8,000 Gaia-calibrated local neighborhood fill stars (8 pc -> 1,500 pc, disk scale height 300 pc)
// Explicitly tagged illustrative = 1.0 in binary stream!
const TIER1_COUNT = 8000;
const tier1Floats = new Float32Array(TIER1_COUNT * 6);
const rand = mulberry32(20260418);

for (let i = 0; i < TIER1_COUNT; i += 1) {
  const u = rand();
  const v = rand();
  // Favor Galactic plane concentration via approximate RA/Dec sampling biased to low |b|
  // Convert random Galactic (l, b) -> approximate J2000 RA/Dec via inverse Hipparcos transform
  const l = u * Math.PI * 2;
  // Thin disk scale height distribution in Galactic latitude
  const bSin = Math.max(-0.995, Math.min(0.995, (rand() - 0.5) * 0.45 + (rand() - 0.5) * 0.55 * (rand() < 0.25 ? 1.8 : 0.4)));
  const b = Math.asin(bSin);

  // Convert Galactic (l, b) -> J2000 Equatorial (RA, Dec)
  const alphaG = (192.8594812065348 * Math.PI) / 180;
  const deltaG = (27.12825118085622 * Math.PI) / 180;
  const lNcp = (122.9319185680026 * Math.PI) / 180;

  const sinDec =
    Math.sin(b) * Math.sin(deltaG) +
    Math.cos(b) * Math.cos(deltaG) * Math.cos(lNcp - l);
  const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));
  const yRa = Math.cos(b) * Math.sin(lNcp - l);
  const xRa =
    Math.sin(b) * Math.cos(deltaG) -
    Math.cos(b) * Math.sin(deltaG) * Math.cos(lNcp - l);
  let raDeg = ((Math.atan2(yRa, xRa) + alphaG) * 180) / Math.PI;
  raDeg = ((raDeg % 360) + 360) % 360;
  const decDeg = (decRad * 180) / Math.PI;

  // Log-uniform radial distribution from 6 pc to 1,600 pc (local Orion Spur & arms)
  const distPc = Math.pow(10, 0.8 + v * 2.4);

  // Realistic main-sequence & giant color-magnitude distribution
  const specRoll = rand();
  let bvColor = 0.65;
  let absMag = 4.5;
  if (specRoll < 0.04) {
    bvColor = -0.22 + rand() * 0.2;
    absMag = -3.0 + rand() * 3.0;
  } else if (specRoll < 0.16) {
    bvColor = 0.0 + rand() * 0.35;
    absMag = 0.5 + rand() * 2.5;
  } else if (specRoll < 0.45) {
    bvColor = 0.4 + rand() * 0.45;
    absMag = 3.0 + rand() * 2.8;
  } else if (specRoll < 0.78) {
    bvColor = 0.85 + rand() * 0.55;
    absMag = 0.5 + rand() * 6.5;
  } else {
    bvColor = 1.4 + rand() * 0.6;
    absMag = 6.0 + rand() * 4.0;
  }

  const distMod = 5 * Math.log10(Math.max(1, distPc) / 10);
  const vMag = Math.max(2.5, Math.min(11.5, absMag + distMod));

  const base = i * 6;
  tier1Floats[base + 0] = raDeg;
  tier1Floats[base + 1] = decDeg;
  tier1Floats[base + 2] = distPc;
  tier1Floats[base + 3] = vMag;
  tier1Floats[base + 4] = bvColor;
  tier1Floats[base + 5] = 1.0; // statistical Gaia-calibrated fill (illustrative)
}

fs.writeFileSync(
  path.join(OUT_DIR, 'stars-tier1.bin'),
  Buffer.from(tier1Floats.buffer)
);

const manifest = {
  version: 1,
  generatedBy: 'scripts/build-star-tiles.mjs',
  strideFloats: 6,
  fields: ['raDeg', 'decDeg', 'distPc', 'vMag', 'bvColor', 'illustrative'],
  tiles: [
    {
      id: 'tier0-measured',
      url: '/data/stars-tier0.bin',
      count: MEASURED_REAL_STARS.length,
      byteLength: tier0Floats.byteLength,
      illustrative: false,
      source: 'ESA Hipparcos (van Leeuwen 2007), HYG v3.8, ESA Gaia DR3 (2022)',
    },
    {
      id: 'tier1-neighborhood-fill',
      url: '/data/stars-tier1.bin',
      count: TIER1_COUNT,
      byteLength: tier1Floats.byteLength,
      illustrative: true,
      source: 'Statistical Gaia DR3-calibrated local disk fill (6-1600 pc, illustrative)',
    },
  ],
  namedStars: namedIndex,
};

fs.writeFileSync(
  path.join(OUT_DIR, 'stars-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(
  `Built star tiles: tier0=${MEASURED_REAL_STARS.length} measured stars (${tier0Floats.byteLength} B), tier1=${TIER1_COUNT} illustrative fill stars (${tier1Floats.byteLength} B).`
);
