// Pre-loaded historical KSEB solar & net-metering data (Jan-25 to Oct-26)
window.SEED_KSEB_BILLS = [
  {
    monthKey: '2025-01', monthLabel: 'Jan-25',
    prevImport: 590, currImport: 806,
    normalImport: null, offPeakImport: null, peakImport: null, netImport: 216,
    prevExport: 1683, currExport: 2256, netExport: 573,
    solarGeneration: 685, exportEfficiency: 83.65, directUsed: 112, directEfficiency: 16.35,
    credit: 357, cumulativeCredit: 1450, billAmount: 212, resetCumulative: false
  },
  {
    monthKey: '2025-02', monthLabel: 'Feb-25',
    prevImport: 806, currImport: 1001,
    normalImport: null, offPeakImport: null, peakImport: null, netImport: 195,
    prevExport: 2256, currExport: 2762, netExport: 506,
    solarGeneration: 583, exportEfficiency: 86.792, directUsed: 77, directEfficiency: 13.208,
    credit: 311, cumulativeCredit: 1761, billAmount: 190, resetCumulative: false
  },
  {
    monthKey: '2025-03', monthLabel: 'Mar-25',
    prevImport: null, currImport: null,
    normalImport: 61, offPeakImport: 61, peakImport: 61, netImport: 183,
    prevExport: 2762, currExport: 3355, netExport: 593,
    solarGeneration: 685, exportEfficiency: 86.57, directUsed: 92, directEfficiency: 13.43,
    credit: 410, cumulativeCredit: 2171, billAmount: 186, resetCumulative: false
  },
  {
    monthKey: '2025-04', monthLabel: 'Apr-25',
    prevImport: null, currImport: null,
    normalImport: 39, offPeakImport: 164, peakImport: 72, netImport: 275,
    prevExport: 3355, currExport: 3972, netExport: 617,
    solarGeneration: 726, exportEfficiency: 84.99, directUsed: 109, directEfficiency: 15.01,
    credit: 342, cumulativeCredit: 2513, billAmount: 236, resetCumulative: false
  },
  {
    monthKey: '2025-05', monthLabel: 'May-25',
    prevImport: null, currImport: null,
    normalImport: 27, offPeakImport: 100, peakImport: 49, netImport: 176,
    prevExport: 3972, currExport: 4535, netExport: 563,
    solarGeneration: 652, exportEfficiency: 86.35, directUsed: 89, directEfficiency: 13.65,
    credit: 387, cumulativeCredit: 387, billAmount: 220, resetCumulative: true
  },
  {
    monthKey: '2025-06', monthLabel: 'Jun-25',
    prevImport: null, currImport: null,
    normalImport: 41, offPeakImport: 132, peakImport: 64, netImport: 237,
    prevExport: 4535, currExport: 5077, netExport: 542,
    solarGeneration: 661, exportEfficiency: 82.0, directUsed: 119, directEfficiency: 18.0,
    credit: 305, cumulativeCredit: 692, billAmount: 260, resetCumulative: false
  },
  {
    monthKey: '2025-07', monthLabel: 'Jul-25',
    prevImport: null, currImport: null,
    normalImport: 34, offPeakImport: 101, peakImport: 55, netImport: 190,
    prevExport: 5077, currExport: 5504, netExport: 427,
    solarGeneration: 515, exportEfficiency: 82.91, directUsed: 88, directEfficiency: 17.09,
    credit: 237, cumulativeCredit: 929, billAmount: 220, resetCumulative: false
  },
  {
    monthKey: '2025-08', monthLabel: 'Aug-25',
    prevImport: null, currImport: null,
    normalImport: 31, offPeakImport: 118, peakImport: 65, netImport: 214,
    prevExport: 5504, currExport: 6052, netExport: 548,
    solarGeneration: 658, exportEfficiency: 83.283, directUsed: 110, directEfficiency: 16.717,
    credit: 334, cumulativeCredit: 1263, billAmount: 240, resetCumulative: false
  },
  {
    monthKey: '2025-09', monthLabel: 'Sep-25',
    prevImport: null, currImport: null,
    normalImport: 44, offPeakImport: 110, peakImport: 46, netImport: 200,
    prevExport: 6052, currExport: 6568, netExport: 516,
    solarGeneration: 641, exportEfficiency: 80.499, directUsed: 125, directEfficiency: 19.501,
    credit: 316, cumulativeCredit: 1579, billAmount: 240, resetCumulative: false
  },
  {
    monthKey: '2025-10', monthLabel: 'Oct-25',
    prevImport: null, currImport: null,
    normalImport: 136, offPeakImport: 277, peakImport: 64, netImport: 477,
    prevExport: 6568, currExport: 7098, netExport: 530,
    solarGeneration: 754, exportEfficiency: 70.292, directUsed: 224, directEfficiency: 29.708,
    credit: 53, cumulativeCredit: 1632, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2025-11', monthLabel: 'Nov-25',
    prevImport: null, currImport: null,
    normalImport: 104, offPeakImport: 185, peakImport: 40, netImport: 329,
    prevExport: 7098, currExport: 7539, netExport: 441,
    solarGeneration: 560, exportEfficiency: 78.75, directUsed: 119, directEfficiency: 21.25,
    credit: 112, cumulativeCredit: 1744, billAmount: 285, resetCumulative: false
  },
  {
    monthKey: '2025-12', monthLabel: 'Dec-25',
    prevImport: null, currImport: null,
    normalImport: 163, offPeakImport: 173, peakImport: 47, netImport: 383,
    prevExport: 7539, currExport: 7937, netExport: 398,
    solarGeneration: 502, exportEfficiency: 79.283, directUsed: 104, directEfficiency: 20.717,
    credit: 15, cumulativeCredit: 1759, billAmount: 285, resetCumulative: false
  },
  {
    monthKey: '2026-01', monthLabel: 'Jan-26',
    prevImport: null, currImport: null,
    normalImport: 128, offPeakImport: 223, peakImport: 57, netImport: 408,
    prevExport: 7937, currExport: 8482, netExport: 545,
    solarGeneration: 671, exportEfficiency: 81.222, directUsed: 126, directEfficiency: 18.778,
    credit: 137, cumulativeCredit: 1896, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-02', monthLabel: 'Feb-26',
    prevImport: null, currImport: null,
    normalImport: 83, offPeakImport: 187, peakImport: 57, netImport: 327,
    prevExport: 8482, currExport: 8945, netExport: 463,
    solarGeneration: 548, exportEfficiency: 84.489, directUsed: 85, directEfficiency: 15.511,
    credit: 136, cumulativeCredit: 2032, billAmount: 285, resetCumulative: false
  },
  {
    monthKey: '2026-03', monthLabel: 'Mar-26',
    prevImport: null, currImport: null,
    normalImport: 125, offPeakImport: 166, peakImport: 52, netImport: 343,
    prevExport: 8945, currExport: 9444, netExport: 499,
    solarGeneration: 641, exportEfficiency: 77.847, directUsed: 142, directEfficiency: 22.153,
    credit: 156, cumulativeCredit: 2188, billAmount: 285, resetCumulative: false
  },
  {
    monthKey: '2026-04', monthLabel: 'Apr-26',
    prevImport: null, currImport: null,
    normalImport: 103, offPeakImport: 169, peakImport: 67, netImport: 338,
    prevExport: 9444, currExport: 10015, netExport: 571,
    solarGeneration: 765, exportEfficiency: 74.641, directUsed: 194, directEfficiency: 25.359,
    credit: 233, cumulativeCredit: 2421, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-05', monthLabel: 'May-26',
    prevImport: null, currImport: null,
    normalImport: 133, offPeakImport: 161, peakImport: 72, netImport: 366,
    prevExport: 10015, currExport: 10592, netExport: 577,
    solarGeneration: 799, exportEfficiency: 72.215, directUsed: 222, directEfficiency: 27.785,
    credit: 211, cumulativeCredit: 211, billAmount: 310, resetCumulative: true
  },
  {
    monthKey: '2026-06', monthLabel: 'Jun-26',
    prevImport: null, currImport: null,
    normalImport: 139, offPeakImport: 138, peakImport: 74, netImport: 351,
    prevExport: 10592, currExport: 10964, netExport: 372,
    solarGeneration: 522, exportEfficiency: 71.264, directUsed: 150, directEfficiency: 28.736,
    credit: 21, cumulativeCredit: 232, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-07', monthLabel: 'Jul-26',
    prevImport: null, currImport: null,
    normalImport: 134, offPeakImport: 224, peakImport: 67, netImport: 425,
    prevExport: 10964, currExport: 11440, netExport: 476,
    solarGeneration: 590, exportEfficiency: 80.678, directUsed: 114, directEfficiency: 19.322,
    credit: 51, cumulativeCredit: 283, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-08', monthLabel: 'Aug-26',
    prevImport: null, currImport: null,
    normalImport: 129, offPeakImport: 242, peakImport: 61, netImport: 432,
    prevExport: 11440, currExport: 11905, netExport: 465,
    solarGeneration: 668, exportEfficiency: 69.611, directUsed: 203, directEfficiency: 30.389,
    credit: 33, cumulativeCredit: 316, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-09', monthLabel: 'Sep-26',
    prevImport: null, currImport: null,
    normalImport: 130, offPeakImport: 209, peakImport: 48, netImport: 387,
    prevExport: 11905, currExport: 12338, netExport: 433,
    solarGeneration: 696, exportEfficiency: 62.213, directUsed: 263, directEfficiency: 37.787,
    credit: 46, cumulativeCredit: 362, billAmount: 310, resetCumulative: false
  },
  {
    monthKey: '2026-10', monthLabel: 'Oct-26',
    prevImport: null, currImport: null,
    normalImport: 130, offPeakImport: 283, peakImport: 72, netImport: 485,
    prevExport: 12338, currExport: 12871, netExport: 533,
    solarGeneration: 757, exportEfficiency: 70.41, directUsed: 224, directEfficiency: 29.59,
    credit: 48, cumulativeCredit: 410, billAmount: 310, resetCumulative: false
  }
];
