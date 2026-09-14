const edi999Parser = (ediString) => {
    const segments = ediString.split('~');
    const parsedData = {
        interchangeControlNumber: '',
        functionalGroupControlNumber: '',
        transactionSetControlNumber: '',
        transactionAcknowledgment: '',
        errors: [],
        numberOfTransactionSets: 0
    };

    segments.forEach(segment => {
        const elements = segment.split('*');
        switch (elements[0]) {
            case 'ISA':
                parsedData.interchangeControlNumber = elements[13];
                break;
            case 'GS':
                parsedData.functionalGroupControlNumber = elements[6];
                break;
            case 'ST':
                parsedData.transactionSetControlNumber = elements[2];
                break;
            case 'AK1':
                parsedData.functionalGroupAcknowledgment = elements[1];
                break;
            case 'AK2':
                parsedData.transactionAcknowledgment = elements[1];
                break;
            case 'IK3':
                parsedData.errors.push({
                    segment: elements[1],
                    line: elements[2],
                    loop: elements[3],
                    errorCode: elements[4]
                });
                break;
            case 'IK5':
                parsedData.transactionStatus = elements[1]; // 'A' = Accepted, 'R' = Rejected
                break;
            case 'AK9':
                parsedData.functionalGroupStatus = elements[1]; // 'A' = Accepted, 'R' = Rejected
                parsedData.numberOfTransactionSets = parseInt(elements[2], 10);
                break;
        }
    });
    
    return parsedData;
};


const parseClaimID = (report) => {
    const lines = report.split(/\r?\n/);

    let claimId = "";
    let errorDescriptions = {};

    // Find the index for ERROR CLAIM DETAIL or ACCEPTED CLAIM DETAIL
    const errorClaimStart = lines.findIndex(line => line.toUpperCase().includes("ERROR CLAIM DETAIL"));
    const acceptedClaimStart = lines.findIndex(line => line.toUpperCase().includes("ACCEPTED CLAIM DETAIL"));

    // Extract error descriptions from Claims Upload File Summary section
    for (let i = 0; i < lines.length; i++) {
        const errorMatch = lines[i].match(/\+--->\s+\d+\s+#\s+errors?\s+(\b[A-Z]+\d+\b)\s*-\s*(.+)/i);
        if (errorMatch) {
            const [_, code, meaning] = errorMatch;
            errorDescriptions[code] = meaning;
        }
    }

    // Function to extract claim ID from a section
    const extractClaimId = (startIndex) => {
        if (startIndex !== -1) {
            for (let i = startIndex; i < lines.length; i++) {
                const claimMatch = lines[i].match(/\d{10}/);
                if (claimMatch) {
                    return claimMatch[0];
                }
            }
        }
        return "";
    };

    // Extract claim ID from ERROR CLAIM DETAIL first, then ACCEPTED CLAIM DETAIL if needed
    claimId = extractClaimId(errorClaimStart) || extractClaimId(acceptedClaimStart);

    return { 
        claimId: claimId || '', 
        errors: Object.entries(errorDescriptions).map(([code, meaning]) => ({ code, meaning }))
    };
}

const parseClaimSummaryFile = (report) => {
    const sourceClaimFileNameMatch =
        report.match(/File Name:\s*(.+)/i) ||
        report.match(/The file\s+(.+?)\s+was split into/i);

    const { claimId, errors } = parseClaimID(report);

    return {
        claimId,
        errors,
        sourceClaimFileName: sourceClaimFileNameMatch?.[1]?.trim() || '',
    };
};


module.exports = {
    edi999Parser,
    parseClaimID,
    parseClaimSummaryFile,
};
