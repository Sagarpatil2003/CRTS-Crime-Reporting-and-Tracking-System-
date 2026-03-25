module.exports = {
    REPORTED: {
        next: ["ASSIGNED", "UNDER_REVIEW", "CLOSED"], 
        allowedRoles: ["CITIZEN", "OFFICER", "ADMIN"]
    },
    ASSIGNED: { 
        next: ["UNDER_REVIEW", "REPORTED", "CLOSED"],
        allowedRoles: ["OFFICER", "ADMIN"]
    },
    UNDER_REVIEW: {
        next: ["INVESTIGATION", "ASSIGNED", "CLOSED"], 
        allowedRoles: ["OFFICER", "ADMIN"]
    },
    INVESTIGATION: {
        next: ["HEARING", "CLOSED"],
        allowedRoles: ["OFFICER", "ADMIN"]
    },
    HEARING: {
        next: ["JUDGEMENT", "CLOSED"],
        allowedRoles: ["JUDGE", "ADMIN"]
    },
    JUDGEMENT: {
        next: ["CLOSED"],
        allowedRoles: ["JUDGE", "ADMIN"]
    },
    CLOSED: {
        next: [],
        allowedRoles: ["ADMIN"]
    }
};