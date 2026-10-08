# campaigns/ — multi-video campaigns

A campaign groups several packages around one goal (a launch, a series, a seasonal push).

```
campaigns/<brand-id>/<campaign-id>/
  CAMPAIGN.md      # goal, audience, message, schedule, packages, success metric
  campaign.json    # machine-readable version of the same
```

Each video in a campaign is still its own package in `content/`. Campaigns never mix brands.
