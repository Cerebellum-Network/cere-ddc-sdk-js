# Unified Data Ingestion SDK/API: Diagrams Index

This document serves as an index for all the Mermaid diagrams created for the Unified Data Ingestion SDK/API architecture project.

## Overview of Diagrams

| #   | Diagram Name                                                         | Description                                                          | Requirements Covered |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------- |
| 0.0 | [Current State](0_0_current_state_problem.mmd)                       | Illustrates the current complexity problem that developers face      |                      |
| 0.1 | [Component Descriptions](0_1_component_descriptions.mmd)             | Detailed component descriptions with responsibilities and interfaces | [§5;]                |
| 1   | [Overall Architecture](1_overall_architecture.mmd)                   | High-level architecture showing all components                       | [§4.1, §4.2;]        |
| 2   | [Metadata Schema](2_metadata_schema.mmd)                             | Structure of the metadata schema with allowed values                 | [§3.2;]              |
| 3   | [Telegram Events Flow](3_use_case_telegram_events.mmd)               | Data flow for Telegram Mini-App quests/events                        | [§3.3;]              |
| 3.1 | [Telegram Messages Flow](3_1_use_case_telegram_messages.mmd)         | Data flow for Telegram messages                                      | [§3.3;]              |
| 4   | [Drone Telemetry Flow](4_use_case_drone_telemetry.mmd)               | Data flow for Drone Telemetry                                        | [§3.3;]              |
| 5   | [Drone Video Flow](5_use_case_drone_video.mmd)                       | Data flow for Drone Video Stream chunks and events                   | [§3.3;]              |
| 6   | [Batch Mode](6_batch_mode.mmd)                                       | Batching component options and considerations                        | [§3.2, §4.1;]        |
| 7   | [Error Handling & Observability](7_error_handling_observability.mmd) | Error handling strategies and observability framework                | [§4.1, §4.2;]        |
| 8   | [Deployment Options](8_deployment_options.mmd)                       | Deployment topology options                                          | [§4.2, §5;]          |
| 9   | [Testing Matrix](9_testing_matrix.mmd)                               | Testing approach and scenarios                                       | [§4.1;]              |
| 10  | [Security Diagram](10_security_diagram.mmd)                          | Security architecture including auth, authz and validation           | [§4.2;]              |
| 11  | [Performance Benchmarks](11_performance_benchmarks.mmd)              | Performance metrics, SLAs and scaling thresholds                     | [§4.2;]              |
| 12  | [Migration Plan](12_migration_plan.mmd)                              | Migration Approach for seamless swtich to new unified SDK/API        |                      |

## How to Use These Diagrams

These diagrams are designed to be viewed in sequence from 1 to 11, as they progress from high-level architecture to implementation details. However, they can also be consulted individually based on specific needs:

- For a general overview of the system: Start with Diagram 1
- For detailed component descriptions: See Diagram 0
- For metadata structure details: See Diagram 2
- For understanding data flows for specific use cases: See Diagrams 3, 3.1, 4-5
- For implementation considerations: See Diagrams 6-8
- For planning and testing strategy: See Diagram 9
- For security and performance specifications: See Diagrams 10 and 11

## Open Questions Highlighted

Throughout the diagrams, open questions and areas requiring clarification are marked with "❓" symbols.

## Rendering the Diagrams

These diagrams are written in Mermaid format (`.mmd`). To render them:

1. Use a Mermaid-compatible viewer or editor
2. Use the Mermaid Live Editor (https://mermaid.live)
3. Use built-in Mermaid support in GitHub, Visual Studio Code, or other tools

## Next Steps

After reviewing these diagrams:

1. Address the open questions with teammates
2. Finalize the architecture based on feedback
3. Create the complete architecture document
