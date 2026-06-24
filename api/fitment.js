// Automated fitment lookup was intentionally removed to avoid implying guaranteed fitment.
// Customers should use the manual FW Wheels fitment contact flow instead.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(410).json({
    error: 'Automated fitment lookup has been removed. Contact FW Wheels for manual fitment help before ordering.'
  });
};
