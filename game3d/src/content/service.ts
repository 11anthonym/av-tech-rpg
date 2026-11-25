// Generated from src/content/data.js by scripts/extract-service-content.mjs.
export const serviceContent = {
  "title": "One Quick Display Swap",
  "summary": "Replace a conference-room display at a Conshohocken office.",
  "appointment": {
    "deadlineMinutes": 780,
    "tightWindowMinutes": 150,
    "phases": [
      {
        "id": "calm",
        "label": "Room Available",
        "summary": "There is still room to investigate without the client hovering over every step."
      },
      {
        "id": "tight",
        "label": "Schedule Tightening",
        "summary": "The next meeting is getting close. Extra certainty now competes with a clean handoff."
      },
      {
        "id": "late",
        "label": "Meeting In Progress",
        "summary": "The handoff window has passed. Technical work now happens in front of a waiting client."
      }
    ],
    "actionMinutes": {
      "client-check-in": 5,
      "client-symptom-timeline": 15,
      "display-failure-pattern": 25,
      "inline-coupler-path": 35,
      "replacement-kit-fit": 15,
      "condition-careful": 15,
      "condition-quick": 6,
      "incident-stabilize": 20,
      "incident-calm-client": 8,
      "incident-document": 10,
      "install-item": 25,
      "verification-full": 25,
      "verification-quick": 8,
      "verification-skip": 2,
      "client-closeout": 10
    },
    "repairMinutes": {
      "verify-path": 45,
      "ticket-swap": 10,
      "isolate-coupler": 35,
      "stage-clean-swap": 15,
      "negotiate-verification-window": 25,
      "label-and-prove-path": 40
    },
    "taskModifiers": {
      "tight": {
        "energyDelta": 1,
        "resultText": "The tightening client schedule made the room work more draining."
      },
      "late": {
        "statDelta": -1,
        "energyDelta": 1,
        "resultText": "Working through the meeting handoff made both diagnosis and installation less forgiving."
      }
    },
    "riskyRepairIncident": {
      "chanceByPhase": {
        "calm": 0,
        "tight": 0.35,
        "late": 0.65
      },
      "resultByPhase": {
        "tight": "The quick swap drops signal during the client handoff check. The client sees the room fail before the repair is settled.",
        "late": "The waiting meeting walks into a visible dropout. The rushed repair now has to be recovered with the client in the room."
      },
      "log": "Immediate service pressure: a rushed repair collided with the client meeting window."
    }
  },
  "diagnosticEvidence": [
    {
      "id": "client-symptom-timeline",
      "label": "Client symptom timeline",
      "sourceLabel": "Client conversation",
      "interactionId": "service-client",
      "skillId": "clientCommunication",
      "summary": "The display powers on before it flickers and drops, and the failure became worse after somebody changed inputs.",
      "conditionIds": [
        "bad-ticket-notes",
        "mislabeled-input",
        "client-time-pressure"
      ]
    },
    {
      "id": "display-failure-pattern",
      "label": "Display failure pattern",
      "sourceLabel": "Failed display",
      "interactionId": "service-display",
      "skillId": "troubleshooting",
      "summary": "The display can produce an image, but the dropout pattern does not prove the panel is the only fault.",
      "conditionIds": [
        "bad-ticket-notes",
        "flaky-replacement-display"
      ]
    },
    {
      "id": "inline-coupler-path",
      "label": "Inline coupler path",
      "sourceLabel": "Signal-path inspection",
      "interactionId": "service-room-pressure",
      "skillId": "troubleshooting",
      "summary": "An inline coupler and conflicting input labels make the signal path a credible second fault.",
      "conditionIds": [
        "bad-ticket-notes",
        "mislabeled-input"
      ]
    },
    {
      "id": "replacement-kit-fit",
      "label": "Replacement kit condition",
      "sourceLabel": "Replacement gear",
      "interactionId": "service-pickup",
      "skillId": "install",
      "summary": "The replacement panel and mount hardware are present, but their fit and condition still need to be proven during installation.",
      "conditionIds": [
        "flaky-replacement-display",
        "loose-mount-hardware"
      ]
    }
  ],
  "roomConditions": [
    {
      "id": "bad-ticket-notes",
      "label": "Bad ticket notes",
      "summary": "The work order says display issue, but the room history points at a path problem.",
      "hiddenSummary": "The ticket notes do not line up cleanly with the room.",
      "revealedSummary": "The email chain says this room has dropped signal before, so the display may not be the whole fault.",
      "prepReveals": [
        "review",
        "josh"
      ],
      "checkModifiers": {
        "signal-path": {
          "difficulty": 1,
          "knownBonus": 1
        }
      },
      "closeoutRisk": "Trusting the ticket can leave the actual signal-path fault for a callback."
    },
    {
      "id": "mislabeled-input",
      "label": "Mislabeled input path",
      "summary": "The wall input and credenza input are labeled like they came from different timelines.",
      "hiddenSummary": "The room labels are not telling the whole truth.",
      "revealedSummary": "The client remembers switching inputs before the display dropped out; the labels are suspect.",
      "prepReveals": [
        "contact"
      ],
      "checkModifiers": {
        "signal-path": {
          "difficulty": 1,
          "knownBonus": 1
        }
      },
      "closeoutRisk": "Skipping verification can leave the wrong input path documented as fixed."
    },
    {
      "id": "flaky-replacement-display",
      "label": "Flaky replacement display",
      "summary": "The replacement display works, but it is less forgiving than the ticket implies.",
      "hiddenSummary": "The replacement gear may not be as clean as the dispatch note sounds.",
      "revealedSummary": "The replacement display has a slightly touchy input board; the install needs a cleaner fit.",
      "checkModifiers": {
        "replacement-display": {
          "difficulty": 1
        },
        "service-install": {
          "difficulty": 1
        }
      },
      "closeoutRisk": "A strained install can become the new reason the room gets called back."
    },
    {
      "id": "loose-mount-hardware",
      "label": "Loose mount hardware",
      "summary": "The hardware tote has the right parts, but the fit needs a careful hand.",
      "hiddenSummary": "The hardware tote is carrying a small install problem.",
      "revealedSummary": "The mount kit is complete but fussy; rushing the hardware can leave a weak install note.",
      "checkModifiers": {
        "mount-hardware": {
          "difficulty": 1
        },
        "service-install": {
          "difficulty": 1
        }
      },
      "closeoutRisk": "A rushed hardware fit can hand the next tech a physical problem instead of a signal problem."
    },
    {
      "id": "client-time-pressure",
      "label": "Client time pressure",
      "summary": "The next meeting is close enough that every extra check feels expensive.",
      "hiddenSummary": "The client schedule is tighter than the ticket admits.",
      "revealedSummary": "The client needs the room back soon; careful work now has visible schedule pressure.",
      "prepReveals": [
        "contact"
      ],
      "checkModifiers": {
        "signal-path": {
          "energy": 1,
          "knownBonus": 1
        },
        "replacement-display": {
          "energy": 1
        },
        "mount-hardware": {
          "energy": 1
        },
        "service-install": {
          "energy": 1
        }
      },
      "closeoutRisk": "Time pressure makes a quick-looking closeout tempting even when the room still has uncertainty."
    }
  ],
  "repairApproaches": [
    {
      "id": "verify-path",
      "label": "Verify the signal path",
      "branchLabel": "Universal",
      "canonicalApproach": "verify",
      "summary": "Use the standard troubleshooting process before treating the display as the whole fault."
    },
    {
      "id": "ticket-swap",
      "label": "Trust the ticket and swap",
      "branchLabel": "Universal",
      "canonicalApproach": "rush",
      "summary": "Take the faster management-friendly path while accepting the room uncertainty."
    },
    {
      "id": "isolate-coupler",
      "label": "Trace and isolate the coupler",
      "branchLabel": "Troubleshooting",
      "canonicalApproach": "verify",
      "summary": "Use the conflicting path evidence to isolate the coupler before replacing hardware.",
      "requiredEvidenceIds": [
        "display-failure-pattern",
        "inline-coupler-path"
      ],
      "unlockAny": [
        {
          "skillId": "troubleshooting",
          "minimum": 4
        }
      ],
      "verificationSkillId": "troubleshooting",
      "checkModifiers": {
        "signal-path": {
          "statDelta": 2,
          "resultText": "The coupler finding narrowed the signal-path check before hardware moved."
        }
      }
    },
    {
      "id": "stage-clean-swap",
      "label": "Stage a clean hardware swap",
      "branchLabel": "Install",
      "canonicalApproach": "rush",
      "summary": "Organize and fit the known replacement package instead of spending the first effort on signal verification.",
      "requiredEvidenceIds": [
        "display-failure-pattern",
        "replacement-kit-fit"
      ],
      "unlockAny": [
        {
          "skillId": "install",
          "minimum": 4
        },
        {
          "toolId": "drill"
        },
        {
          "traitId": "residentialInstinct"
        }
      ],
      "checkModifiers": {
        "service-install": {
          "statDelta": 2,
          "energyDelta": -2,
          "resultText": "The staged hardware finding made the replacement package easier to land cleanly."
        }
      }
    },
    {
      "id": "negotiate-verification-window",
      "label": "Negotiate a verification window",
      "branchLabel": "Client Communication",
      "canonicalApproach": "verify",
      "summary": "Set a calm expectation with the client, then prove the room without pretending the meeting pressure disappeared.",
      "requiredEvidenceIds": [
        "client-symptom-timeline",
        "display-failure-pattern"
      ],
      "unlockAny": [
        {
          "skillId": "clientCommunication",
          "minimum": 4
        },
        {
          "traitId": "calmUnderFire"
        }
      ],
      "verificationSkillId": "clientCommunication",
      "controlsConditionId": "client-time-pressure",
      "appointmentExtensionMinutes": 30,
      "checkModifiers": {
        "signal-path": {
          "statDelta": 1,
          "resultText": "The client-approved verification window reduced social pressure during the room check."
        }
      }
    },
    {
      "id": "label-and-prove-path",
      "label": "Build a labeled path note",
      "branchLabel": "Documentation",
      "canonicalApproach": "verify",
      "summary": "Turn the conflicting labels into a usable path record while proving what actually reaches the display.",
      "requiredEvidenceIds": [
        "display-failure-pattern",
        "inline-coupler-path"
      ],
      "unlockAny": [
        {
          "skillId": "documentation",
          "minimum": 3
        },
        {
          "toolId": "labeler"
        },
        {
          "traitId": "notebookHabit"
        }
      ],
      "verificationSkillId": "documentation",
      "checkModifiers": {
        "signal-path": {
          "statDelta": 1,
          "resultText": "The labeled path note turned conflicting room labels into usable verification evidence."
        }
      }
    }
  ],
  "route": {
    "id": "conshohockenService",
    "fromAreaId": "shop",
    "toAreaId": "serviceOffice",
    "fromLabel": "WAYNE AREA",
    "toLabel": "CONSHOHOCKEN",
    "destinationSceneId": "serviceOffice",
    "actionLabel": "Drive to Client Office",
    "packedLunchContext": "the Conshohocken service call",
    "arrivalTime": "9:14 AM",
    "arrivalLog": "Arrived in Conshohocken for a display service call.",
    "fastTravelEligible": true
  }
} as const;
