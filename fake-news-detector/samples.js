// Sample articles and headlines database for testing TruthGuard AI
const SAMPLE_DATA = [
  {
    id: "sample-1",
    title: "NASA Webb Telescope Detects Evidence of Carbon Molecules in Exoplanet Atmosphere",
    category: "Science & Tech",
    type: "Legitimate News",
    expectedTier: "verified",
    url: "https://www.nasa.gov/press-release/webb-discovers-methane-carbon-dioxide-exoplanet",
    content: `Astronomers analyzing data from NASA's James Webb Space Telescope have discovered evidence of carbon-bearing molecules, including methane and carbon dioxide, in the atmosphere of exoplanet K2-18 b.

The study, published in the peer-reviewed Astrophysical Journal Letters, indicates that K2-18 b, which is 8.6 times as massive as Earth, may possess a hydrogen-rich atmosphere above a water-covered ocean.

"Our findings underscore the importance of considering diverse habitable environments in the search for life elsewhere," said Dr. Nikku Madhusudhan, an astronomer at the University of Cambridge and lead author of the paper.

The team conducted rigorous spectroscopic observations across multiple infrared channels. While the initial detection is statistically robust with a 99.7% confidence interval, NASA researchers emphasized that further independent observations are required before confirming whether life-related bio-signatures exist on the distant world.`
  },
  {
    id: "sample-2",
    title: "SHOCKING SECRET: Miracle Fruit Cures 100% of All Diseases In Just 48 Hours - Doctors Terrified!",
    category: "Health Misinformation",
    type: "Viral Fabricated Hoax",
    expectedTier: "fake",
    url: "https://daily-secret-truth-exposed.xyz/miracle-cure-fruit-doctors-hate",
    content: `BIG PHARMA DOES NOT WANT YOU TO KNOW THIS! A secret jungle fruit discovered deep in the Amazon rainforest has been proven to completely eliminate and vaporize ALL terminal illnesses and chronic pain in just 48 hours!!

Mainstream corrupt doctors and hospitals are TERRIFIED because this 100% natural miracle seed makes their billion-dollar medicines obsolete! Insiders reveal that government agencies are actively trying to ban this ancient remedy before midnight tonight!

"I ate just one spoonful and my arthritis, diabetes, and vision loss were completely eradicated overnight!" claims anonymous whistleblower John D. 

Act IMMEDIATELY before global elites take this page down forever! Click the link below to claim your emergency bottle before supplies are confiscated by federal agents!! SHARE THIS WITH EVERYONE YOU LOVE BEFORE IT'S DELETED!`
  },
  {
    id: "sample-3",
    title: "Central Bank Announces Adjusted Interest Rate Policy Amid Modest Inflation Softening",
    category: "Economy",
    type: "Legitimate News",
    expectedTier: "verified",
    url: "https://www.reuters.com/markets/central-bank-policy-rate-update-2025",
    content: `The Federal Reserve Board announced a 25-basis-point reduction in its benchmark lending rate on Wednesday, citing moderate cooling across core consumer price indices and balanced labor market figures.

According to the official monetary policy statement released at 2:00 PM EST, the benchmark federal funds rate was shifted to a target range of 4.25% to 4.50%. The vote was backed by a 10-2 majority of board governors.

"Inflation has eased substantially over the past year while economic activity has continued to expand at a steady pace," the committee stated in its published minutes. Department of Labor statistics indicate that annualized CPI decelerated to 2.4% last month, down from 2.7% the prior quarter. Financial analysts polled by Bloomberg anticipate steady yields through the fiscal quarter.`
  },
  {
    id: "sample-4",
    title: "URGENT WARNING: Smart Meters Transmit Mind-Altering Frequency Signals Into Living Rooms",
    category: "Conspiracy Hoax",
    type: "Sensational Conspiracy",
    expectedTier: "fake",
    url: "https://freedom-truth-alert.ru/smart-meters-secret-frequencies",
    content: `WAKE UP PATRIOTS! Top secret whistleblower documents leaked by anonymous patriotic engineers prove that utility companies are installing military-grade mind-control pulse transmitters directly onto ordinary residential power meters!!

These covert 5G pulsed waves vibrate at exactly 432 Hz to manipulate sleep patterns, induce artificial lethargy, and force suburban families into subconscious obedience. Mainstream media puppet networks will never tell you the truth because they are paid off by shadow organizations!

Thousands of households are reporting unexplained humming noises and sudden headaches. Do NOT let utility technicians touch your property! Wrap your circuit breakers in heavy tinfoil immediately and demand paper billing before the master switch is activated!`
  },
  {
    id: "sample-5",
    title: "Study Finds Moderate Mediterranean Diet Correlated With Improved Cardiovascular Markers",
    category: "Health & Science",
    type: "Legitimate News",
    expectedTier: "verified",
    url: "https://www.bmj.com/content/380/bmj.p412",
    content: `A multi-year longitudinal observational study following 12,500 participants across four European nations found that adherence to a Mediterranean-style dietary pattern is associated with a 19% reduced relative risk of major adverse cardiovascular events.

The research, led by epidemiologists at Karolinska Institute and published in the British Medical Journal, adjusted for confounding factors including age, baseline body mass index, smoking history, and physical activity levels.

"While observational associations cannot establish direct causality, our biometric markers showed consistent improvements in HDL cholesterol ratios and inflammatory biomarkers among high-adherence cohorts," noted Dr. Elena Lindqvist, lead investigator. The authors noted several limitations, including reliance on self-reported dietary frequency questionnaires.`
  },
  {
    id: "sample-6",
    title: "Tech Giant Accused of Secretly Training AI on Millions of Unwitting Smart Refrigerator Photos",
    category: "Sensational Tech",
    type: "Questionable / Clickbait",
    expectedTier: "questionable",
    url: "https://tech-leak-insider.blog/smart-fridge-photo-training-controversy",
    content: `Did your smart fridge betray your late-night snacking secrets to an artificial intelligence model? Leaked unverified chat logs from a prominent discussion forum claim that smart appliance firmware was secretly updated to upload interior camera snapshots to cloud servers.

Tech bloggers are buzzing with anger over claims that thousands of milk cartons and leftover pizza boxes were cataloged without explicit opt-in confirmation. While the tech company has not officially confirmed the rumor, privacy advocates are calling for immediate congressional inquiries.

"If true, this represents a bizarre and unacceptable intrusion into domestic privacy," said one anonymous cyber security consultant quoted on social media.`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_DATA };
}
