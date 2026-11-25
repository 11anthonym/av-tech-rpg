// Generated from src/content/data.js and service-dispatch-system.js by scripts/extract-service-content.mjs.
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
  },
  "checks": [
    {
      "id": "signal-path",
      "label": "Verify signal path",
      "type": "signal-path verification",
      "skillId": "troubleshooting",
      "difficulty": 4,
      "contextId": "service-diagnosis",
      "energyCost": 4,
      "requiredTool": "room access",
      "optionalTool": "toolBag",
      "riskFlag": "serviceVerificationStrained",
      "riskLabel": "unlabeled coupler",
      "successText": "Signal path is proven before the display swap becomes the whole explanation.",
      "strainedText": "The path is checked, but the coupler note is thin enough to leave return-trip risk.",
      "log": "the unlabeled coupler is verified before the display swap",
      "detail": "The display is failing, but the inline coupler behind the credenza is the part of the room most likely to make a simple swap lie."
    },
    {
      "id": "replacement-display",
      "label": "Install replacement display",
      "type": "display install",
      "skillId": "install",
      "difficulty": 4,
      "contextId": "service-install",
      "energyCost": 10,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "serviceInstallStrained",
      "riskLabel": "strained display swap",
      "successText": "Replacement display is installed cleanly enough to keep closeout focused on the room fault.",
      "strainedText": "Replacement display works, but the install fought back and needs a stronger closeout read.",
      "log": "the replacement display is mounted and connected",
      "detail": "The replacement display is onsite and heavier than the phrase 'quick swap' deserves."
    },
    {
      "id": "mount-hardware",
      "label": "Install mount hardware",
      "type": "mount hardware",
      "skillId": "install",
      "difficulty": 3,
      "contextId": "service-install",
      "energyCost": 10,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "serviceInstallStrained",
      "riskLabel": "loose service hardware",
      "successText": "Mount hardware is landed without turning the replacement into a second problem.",
      "strainedText": "Mount hardware holds, but the rushed fit should not be hidden in closeout.",
      "log": "the hardware tote has exactly enough of the right parts",
      "detail": "The mount hardware tote contains the right parts in a bag labeled for a different room, because optimism is free."
    },
    {
      "id": "final-verification",
      "label": "Prove the repaired room",
      "type": "post-repair verification",
      "skillId": "troubleshooting",
      "difficulty": 3,
      "contextId": "service-final-verification",
      "energyCost": 4,
      "requiredTool": "room access",
      "optionalTool": "toolBag",
      "riskFlag": "serviceFinalVerificationWeak",
      "riskLabel": "weak final verification",
      "successText": "The repaired room survives a full source, path, and display test before client handoff.",
      "strainedText": "The final test exposes a dropout while the technician can still recover or document it.",
      "log": "the repaired room is tested across the final signal path",
      "detail": "The replacement display is installed. The remaining question is whether the room is fixed or only looks fixed from the credenza."
    }
  ],
  "swapItems": [
    {
      "id": "replacement-display",
      "label": "Replacement display"
    },
    {
      "id": "mount-hardware",
      "label": "Mount hardware tote"
    }
  ],
  "finalVerification": {
    "choices": [
      {
        "id": "full",
        "label": "Run a full room test",
        "detail": "Prove the installed display across the room path. This takes the most time but can expose a weak diagnosis before the client inherits it."
      },
      {
        "id": "quick",
        "label": "Run a quick confidence check",
        "detail": "Test the visible path and handoff sooner. A weak diagnosis may show itself while the client is still waiting."
      },
      {
        "id": "skip",
        "label": "Hand the room back unverified",
        "detail": "Protect the schedule now and knowingly leave the next visit with the uncertainty you did not test."
      }
    ],
    "quickIncident": {
      "baseChance": 0.15,
      "rushedApproachPenalty": 0.2,
      "strainedInstallPenalty": 0.15,
      "tightSchedulePenalty": 0.1,
      "lateSchedulePenalty": 0.2,
      "evidenceReduction": 0.1,
      "result": "The display drops during the confidence check. The installed hardware is present, but the diagnosis is not strong enough for an honest handoff.",
      "log": "Final confidence check exposed a dropout before client closeout."
    }
  },
  "baseSkills": {
    "install": 2,
    "troubleshooting": 2,
    "documentation": 2,
    "clientCommunication": 2,
    "fieldcraft": 2,
    "commercialProcess": 2,
    "networking": 1,
    "dspAudio": 1,
    "controlSystems": 1,
    "toolPreparedness": 1,
    "improvisation": 1,
    "burnoutResistance": 2
  },
  "traitContextBonuses": {
    "notebookHabit": [
      {
        "skillId": "documentation",
        "contextIds": [
          "survey-documentation",
          "secure-access-documentation",
          "callback-documentation",
          "handoff-documentation",
          "commissioning-documentation",
          "systems-documentation",
          "retrofit-documentation",
          "retrofit-install-closeout"
        ],
        "bonus": 1
      }
    ],
    "byTheBook": [
      {
        "skillId": "documentation",
        "contextIds": [
          "survey-documentation",
          "secure-access-documentation",
          "callback-documentation",
          "handoff-documentation",
          "commissioning-documentation",
          "systems-documentation",
          "retrofit-documentation",
          "retrofit-install-closeout"
        ],
        "bonus": 1
      },
      {
        "skillId": "troubleshooting",
        "contextIds": [
          "service-diagnosis",
          "commissioning-troubleshooting",
          "callback-troubleshooting"
        ],
        "bonus": 1
      }
    ],
    "calmUnderFire": [
      {
        "skillId": "clientCommunication",
        "contextIds": [
          "survey-pressure",
          "secure-access-pressure",
          "handoff-pressure",
          "commissioning-pressure",
          "retrofit-pressure"
        ],
        "bonus": 1
      }
    ],
    "knowsAGuy": [
      {
        "skillId": "clientCommunication",
        "contextIds": [
          "survey-pressure",
          "secure-access-pressure",
          "handoff-pressure",
          "commissioning-pressure",
          "retrofit-pressure"
        ],
        "bonus": 1
      }
    ],
    "steadyHands": [
      {
        "skillId": "install",
        "contextIds": [
          "cart-assembly",
          "service-install",
          "commissioning-termination",
          "retrofit-install"
        ],
        "bonus": 1
      }
    ]
  },
  "tools": {
    "screwdriver": {
      "id": "screwdriver",
      "name": "Basic Screwdriver",
      "description": "The one tool you knew to bring.",
      "effect": "Allows basic assembly.",
      "price": 0
    },
    "toolBag": {
      "id": "toolBag",
      "name": "Tool Bag",
      "description": "A place for your tools that is not a cardboard box.",
      "effect": "Reduce energy spent picking up equipment by 1.",
      "modifiers": {
        "pickupEnergyReduction": 1
      },
      "skillBonuses": {
        "fieldcraft": 1
      },
      "price": 65
    },
    "drill": {
      "id": "drill",
      "name": "Basic Drill",
      "description": "Entry-level, but the battery is yours.",
      "effect": "Reduce energy spent assembling equipment by 4.",
      "modifiers": {
        "assemblyEnergyReduction": 4
      },
      "skillBonuses": {
        "install": 1
      },
      "price": 125
    },
    "handTruck": {
      "id": "handTruck",
      "name": "Folding Hand Truck",
      "description": "Carry more gear before your next garage trip.",
      "effect": "Carry one additional equipment group during garage unloads.",
      "modifiers": {
        "garageCarryCapacityBonus": 1
      },
      "skillBonuses": {
        "fieldcraft": 1
      },
      "price": 100
    }
  },
  "responses": {
    "bad-ticket-notes": [
      {
        "id": "document",
        "label": "Document signal-path discrepancy",
        "detail": "Spend steady effort making the signal-path problem visible before closeout. Coworkers benefit from the note; management dislikes the delay.",
        "result": "Bad ticket notes is controlled by a clear signal-path note.",
        "log": "Documented bad ticket notes before closing the service call.",
        "energyCost": 2,
        "reputation": {
          "coworkers": 1,
          "management": -1
        },
        "stat": "documentedTaskRisks",
        "controlled": true
      },
      {
        "id": "quick-trace",
        "label": "Quick-trace the path",
        "detail": "Fast troubleshooting can preserve the schedule without doing a full signal-path proof. This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.",
        "result": "Bad ticket notes holds after a quick trace.",
        "log": "Quick-traced bad ticket notes without a visible dropout.",
        "energyCost": 1,
        "reputation": {
          "management": 1
        },
        "stat": "",
        "controlled": true,
        "incidentChance": 0.35,
        "incidentResult": "The signal drops while the client is watching; the room is working again, but trust in the closeout is damaged.",
        "incidentLog": "Immediate service pressure: the signal dropped in front of the client during a quick trace.",
        "incidentReputation": {
          "clients": -2,
          "management": -1
        },
        "incidentBurnout": 1,
        "incidentFlags": {
          "serviceVerificationStrained": true
        }
      },
      {
        "id": "leave",
        "label": "Leave it for closeout",
        "detail": "Saves energy now, but this pressure can still create callback debt.",
        "result": "Bad ticket notes was left unresolved for closeout.",
        "log": "Bad ticket notes left unresolved during the Conshohocken service call.",
        "controlled": false
      }
    ],
    "mislabeled-input": [
      {
        "id": "document",
        "label": "Document signal-path discrepancy",
        "detail": "Spend steady effort making the signal-path problem visible before closeout. Coworkers benefit from the note; management dislikes the delay.",
        "result": "Mislabeled input path is controlled by a clear signal-path note.",
        "log": "Documented mislabeled input path before closing the service call.",
        "energyCost": 2,
        "reputation": {
          "coworkers": 1,
          "management": -1
        },
        "stat": "documentedTaskRisks",
        "controlled": true
      },
      {
        "id": "quick-trace",
        "label": "Quick-trace the path",
        "detail": "Fast troubleshooting can preserve the schedule without doing a full signal-path proof. This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.",
        "result": "Mislabeled input path holds after a quick trace.",
        "log": "Quick-traced mislabeled input path without a visible dropout.",
        "energyCost": 1,
        "reputation": {
          "management": 1
        },
        "stat": "",
        "controlled": true,
        "incidentChance": 0.35,
        "incidentResult": "The signal drops while the client is watching; the room is working again, but trust in the closeout is damaged.",
        "incidentLog": "Immediate service pressure: the signal dropped in front of the client during a quick trace.",
        "incidentReputation": {
          "clients": -2,
          "management": -1
        },
        "incidentBurnout": 1,
        "incidentFlags": {
          "serviceVerificationStrained": true
        }
      },
      {
        "id": "leave",
        "label": "Leave it for closeout",
        "detail": "Saves energy now, but this pressure can still create callback debt.",
        "result": "Mislabeled input path was left unresolved for closeout.",
        "log": "Mislabeled input path left unresolved during the Conshohocken service call.",
        "controlled": false
      }
    ],
    "flaky-replacement-display": [
      {
        "id": "stabilize",
        "label": "Stabilize replacement input board",
        "detail": "Spend extra effort on the replacement path before the room gets booked again.",
        "result": "Replacement input-board pressure is controlled before closeout.",
        "log": "Stabilized the replacement display input board before closeout.",
        "energyCost": 3,
        "reputation": {
          "coworkers": 1
        },
        "stat": "carefulFinishes",
        "controlled": true
      },
      {
        "id": "force-board",
        "label": "Force the replacement board",
        "detail": "A quick board reseat might get the meeting moving without a careful bench check. This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.",
        "result": "The replacement input board settles after a quick reseat.",
        "log": "Forced the replacement input board into service without an immediate failure.",
        "energyCost": 1,
        "reputation": {
          "management": 1
        },
        "stat": "",
        "controlled": true,
        "incidentChance": 0.45,
        "incidentResult": "The replacement display flickers hard after the quick reseat. The client sees the failure and the install now needs extra recovery.",
        "incidentLog": "Immediate service pressure: the replacement display flickered hard after a rushed board reseat.",
        "incidentReputation": {
          "clients": -2,
          "management": -1
        },
        "incidentBurnout": 1,
        "incidentFlags": {
          "serviceInstallStrained": true
        }
      },
      {
        "id": "leave",
        "label": "Leave it for closeout",
        "detail": "Saves energy now, but this pressure can still create callback debt.",
        "result": "Flaky replacement display was left unresolved for closeout.",
        "log": "Flaky replacement display left unresolved during the Conshohocken service call.",
        "controlled": false
      }
    ],
    "loose-mount-hardware": [
      {
        "id": "square",
        "label": "Square the mount hardware",
        "detail": "Spend extra effort now, but prevent a shaky install from becoming the next tech's problem.",
        "result": "Loose mount pressure is controlled by extra hardware cleanup.",
        "log": "Squared the loose mount hardware before closing the service call.",
        "energyCost": 3,
        "reputation": {
          "clients": 1
        },
        "stat": "carefulFinishes",
        "controlled": true
      },
      {
        "id": "snug-mount-fast",
        "label": "Snug the mount fast",
        "detail": "A fast hardware pass can save energy if the mount is less loose than it looks. This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.",
        "result": "The mount holds after a fast hardware pass.",
        "log": "Snugged the loose mount hardware quickly and it held under test.",
        "energyCost": 1,
        "reputation": {
          "management": 1
        },
        "stat": "",
        "controlled": true,
        "incidentChance": 0.4,
        "incidentResult": "The display sags during the fast hardware pass. Nothing breaks, but the client sees a shaky install and the room needs extra recovery.",
        "incidentLog": "Immediate service pressure: the display sagged during a rushed mount pass.",
        "incidentReputation": {
          "clients": -2,
          "management": -1
        },
        "incidentBurnout": 1,
        "incidentFlags": {
          "serviceInstallStrained": true
        }
      },
      {
        "id": "leave",
        "label": "Leave it for closeout",
        "detail": "Saves energy now, but this pressure can still create callback debt.",
        "result": "Loose mount hardware was left unresolved for closeout.",
        "log": "Loose mount hardware left unresolved during the Conshohocken service call.",
        "controlled": false
      }
    ],
    "client-time-pressure": [
      {
        "id": "expectation",
        "label": "Set client expectation",
        "detail": "Tell the client the swap may need verification time. It protects the room, but slows the management-friendly path.",
        "result": "Client time pressure is controlled by setting expectations before closeout.",
        "log": "Set the client's expectation that verification could beat a rushed swap.",
        "energyCost": 1,
        "reputation": {
          "clients": 1,
          "management": -1
        },
        "controlled": true
      },
      {
        "id": "promise-fast",
        "label": "Promise the room will be ready",
        "detail": "A confident promise can keep the client calm if the swap really stays smooth. This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.",
        "result": "The client accepts the quick promise and gives you room to finish.",
        "log": "Promised a fast room recovery and kept the client calm.",
        "energyCost": 1,
        "reputation": {
          "management": 1
        },
        "stat": "",
        "controlled": true,
        "incidentChance": 0.3,
        "incidentResult": "The room is not ready as promised. The client gets angry before closeout and future service trust drops.",
        "incidentLog": "Immediate service pressure: the client got angry after a rushed room-ready promise slipped.",
        "incidentReputation": {
          "clients": -2,
          "management": -1
        },
        "incidentBurnout": 1,
        "incidentFlags": {
          "serviceClientAngry": true
        }
      },
      {
        "id": "leave",
        "label": "Leave it for closeout",
        "detail": "Saves energy now, but this pressure can still create callback debt.",
        "result": "Client time pressure was left unresolved for closeout.",
        "log": "Client time pressure left unresolved during the Conshohocken service call.",
        "controlled": false
      }
    ]
  },
  "recoveries": {
    "ordinary": [
      {
        "id": "stabilize",
        "label": "Stabilize room and own the delay",
        "detail": "Spend steady effort to fix the visible problem, explain the delay, and protect the next visit. Coworkers and clients respect it; management dislikes the time.",
        "result": "The room incident is recovered before closeout. The immediate problem is no longer callback pressure by itself.",
        "log": "Recovered the the room incident incident before closeout.",
        "energyCost": 3,
        "reputation": {
          "clients": 1,
          "coworkers": 1,
          "management": -1
        },
        "stat": "documentedTaskRisks",
        "recovered": true,
        "controlled": true
      },
      {
        "id": "calm-client",
        "label": "Calm the client and keep moving",
        "detail": "Recover some trust in the room, but leave the technical uncertainty for closeout.",
        "result": "The room incident is calmer in the moment, but the technical risk remains open.",
        "log": "Calmed the client after the the room incident incident, but the technical risk remained.",
        "energyCost": 1,
        "reputation": {
          "clients": 1
        },
        "mitigated": true,
        "controlled": false
      },
      {
        "id": "carry",
        "label": "Carry it into closeout",
        "detail": "Spend nothing now. The incident stays open and will shape the return-trip risk.",
        "result": "The room incident stays open for closeout.",
        "log": "The room incident incident carried into closeout.",
        "controlled": false
      }
    ],
    "final": [
      {
        "id": "stabilize",
        "label": "Reopen the path and stabilize it",
        "detail": "Spend the time to isolate the dropout, rerun the room test, and own the delay before client handoff.",
        "result": "The final-test dropout is recovered and the repaired room survives the repeated path test.",
        "log": "Recovered the failed final room test before client closeout.",
        "energyCost": 3,
        "reputation": {
          "clients": 1,
          "coworkers": 1,
          "management": -1
        },
        "stat": "carefulFinishes",
        "recovered": true,
        "controlled": true
      },
      {
        "id": "document",
        "label": "Document the failed handoff honestly",
        "detail": "Protect the next technician with an exact failure note. The client still inherits an unresolved room, but the diagnosis will not be hidden.",
        "result": "The weak final test is documented for the return visit instead of being presented as a completed repair.",
        "log": "Documented the failed Conshohocken handoff and left the technical risk visible.",
        "energyCost": 1,
        "reputation": {
          "coworkers": 1,
          "clients": -1
        },
        "stat": "documentedTaskRisks",
        "mitigated": true,
        "controlled": false
      },
      {
        "id": "carry",
        "label": "Hand the room back anyway",
        "detail": "Spend nothing else. The client gets a working-looking room and the return trip inherits the exposed dropout.",
        "result": "The known final-test dropout is carried into closeout without recovery or a stronger note.",
        "log": "Carried a known final-test dropout into client closeout.",
        "controlled": false
      }
    ]
  }
} as const;
