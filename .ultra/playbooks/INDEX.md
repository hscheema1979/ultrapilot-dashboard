# UltraPilot Playbook Library

## Available Playbooks

### UltraPilot Workspace (VPS5)

#### Development
1. **[Create New Feature](ultrapilot/development/create-new-feature.md)**
   - ID: `ultrapilot-dev-feature`
   - Create feature branch and scaffold files
   - Duration: 15 minutes
   - Agent: ultra:executor

#### Operations
1. **[System Health Check](ultrapilot/operations/health-check.md)**
   - ID: `ultrapilot-ops-health`
   - Comprehensive health check
   - Duration: 2 minutes
   - Agent: ultra:autoloop-coordinator

#### Deployment
1. **[Deploy Dashboard](ultrapilot/deployment/deploy-dashboard.md)**
   - ID: `ultrapilot-deploy-dashboard`
   - Zero-downtime deployment
   - Duration: 10 minutes
   - Agent: ultra:executor

### trading-at Workspace (VPS4)

#### Trading
1. **[Execute Trading Strategy](trading-at/trading/execute-trade.md)**
   - ID: `trading-execute-strategy`
   - Execute trades with risk management
   - Duration: 5 minutes
   - Agent: trading:executor

#### Monitoring
1. **[Portfolio Health Monitor](trading-at/monitoring/portfolio-health.md)**
   - ID: `trading-portfolio-health`
   - Monitor portfolio and risk metrics
   - Duration: 3 minutes
   - Agent: trading:monitor

## Playbook Execution

### From Dashboard

1. Navigate to `/dashboard/playbooks`
2. Browse by workspace and category
3. Select playbook
4. Configure parameters
5. Assign agents (or use defaults)
6. Click "Execute"
7. Monitor progress in `/dashboard/workflows`

### Via GitHub

Playbooks can also be executed by creating issues with:
- Title: `Playbook: {Playbook Name}`
- Labels: `playbook:{playbook-id}`, `workflow`
- Body: YAML parameter configuration

## Playbook Management

### Creating New Playbooks

1. Create file in appropriate directory:
   ```
   .ultra/playbooks/{workspace}/{category}/{playbook-name}.md
   ```

2. Follow playbook schema (see PLAYBOOK-SCHEMA.md)

3. Add to INDEX.md

4. Test execution before using in production

### Updating Playbooks

1. Edit playbook markdown file
2. Increment version number
3. Document changes in playbook body
4. Test thoroughly

## Playbook Categories

### Development
- Feature creation
- Bug fixes
- Code generation
- Testing

### Operations
- Health checks
- Maintenance
- Backups
- Log rotation

### Monitoring
- System metrics
- Application performance
- Error tracking
- Alerting

### Deployment
- Production deployments
- Rollbacks
- Blue-green releases
- Canary deployments

### Trading (trading-at)
- Trade execution
- Strategy analysis
- Risk management
- Portfolio monitoring

## Playbook Parameters

### Common Parameters

**repo**: Repository name
**branch**: Git branch
**environment**: Target environment
**symbol**: Trading symbol
**quantity**: Trade quantity
**risk_percent**: Risk percentage

### Parameter Types

- `string`: Text input
- `integer`: Number input
- `float`: Decimal number
- `select`: Dropdown selection
- `boolean`: Checkbox

## Agent Assignments

### Default Agents

Playbooks have default agent assignments but can be overridden:

**ultra:executor** - General execution
**ultra:test-engineer** - Testing and QA
**ultra:verifier** - Verification and validation
**ultra:autoloop-coordinator** - Monitoring and coordination
**trading:executor** - Trade execution
**trading:analyzer** - Market analysis
**trading:risk-manager** - Risk management
**trading:monitor** - Portfolio monitoring

### Custom Agents

Agents can be specified per step in the playbook:

```yaml
steps:
  - name: "Run tests"
    agent: "ultra:test-engineer"  # Custom agent for this step
    commands: [...]
```

## Playbook Execution Flow

```
User selects playbook
         ↓
User configures parameters
         ↓
User assigns agents
         ↓
Create GitHub workflow issue
         ↓
Dashboard shows new workflow
         ↓
Agent reads playbook
         ↓
Agent executes steps sequentially
         ↓
Progress updated via comments
         ↓
Success criteria validated
         ↓
Issue marked complete
         ↓
Results summarized
```

## Playbook Monitoring

All playbook executions are tracked as workflows and can be monitored:
- In dashboard: `/dashboard/workflows`
- On GitHub: Issues with `playbook:*` labels
- Via API: `/api/v1/workflows`

## Playbook History

Execution history is maintained:
- In GitHub issue comments
- In dashboard workflow display
- In agent execution logs

## Best Practices

1. **Start Simple**: Begin with basic playbooks
2. **Test Thoroughly**: Test before production use
3. **Document Well**: Clear descriptions and parameters
4. **Version Control**: Track changes with versions
5. **Monitor Execution**: Watch playbook runs closely
6. **Iterate**: Improve based on execution results
7. **Reuse**: Build on existing playbooks
8. **Share**: Publish useful playbooks to team

## Troubleshooting

### Playbook Not Appearing
- Check playbook is in correct directory
- Verify playbook follows schema
- Check INDEX.md includes playbook

### Execution Failing
- Check agent is available
- Verify prerequisites met
- Review agent execution logs
- Check parameter values

### Parameters Not Working
- Verify parameter syntax
- Check required vs optional
- Validate parameter types
- Test default values

## Next Steps

1. Browse available playbooks
2. Select playbook for your task
3. Configure parameters
4. Execute and monitor
5. Provide feedback for improvements
