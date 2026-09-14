const fs = require('fs');

function addSubdomainToHosts(subdomain) {
    const hostsPath = '/etc/hosts';
    const entry = `127.0.0.1   ${subdomain}.swift-chart.com`;

    fs.appendFileSync(hostsPath, `${entry}\n`);
    console.log(`Added ${subdomain}.swift-chart.com to hosts file.`);
}

// Usage example:
addSubdomainToHosts('mountsinai');