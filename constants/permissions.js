const permissionsMap = {
  CITIZEN: [
    "REPORT_CASE", 
    "VIEW_CASE_LOGS" 
  ],

  OFFICER: [
    "INVESTIGATE_CASE",
    "VERIFY_EVIDENCE",
    "UPDATE_CASE_STATUS",
    "VIEW_CASE_LOGS" 
  ],

  LAWYER: [
    "ADD_LEGAL_COMMENT",
    "VIEW_CASE_DETAILS",
    "VIEW_CASE_LOGS" 
  ],

  JUDGE: [
    "FINALIZE_VERDICT",
    "UPDATE_CASE_STATUS",
    "VIEW_CASE_LOGS"
  ],

  ADMIN: [
    "MANAGE_USERS",
    "VIEW_ANALYTICS",
    "INVESTIGATE_CASE",  
    "UPDATE_CASE_STATUS",
    "VIEW_CASE_LOGS"
  ]
};

module.exports = permissionsMap