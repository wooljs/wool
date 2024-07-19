Wool
=

An exploration on CQRS, EventSourcing, Reactive, Flux and all this kind of sh*t.

Work in progress

```mermaid
---
title: Dependencies graph
---
graph TD;

    wool-->wool-entity
    wool-->wool-model
    wool-->wool-rule
    wool-->wool-store
    wool-->wool-stream
    wool-->wool-validate
    
    wool-entity-->wool-store
    wool-entity-->wool-validate

    wool-rule-->wool-model
    wool-rule-->wool-store
    wool-rule-->wool-validate
    
    wool-validate-->wool-store
```
