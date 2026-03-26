# Contributing to IDSN Portal

Thank you for your interest in contributing to the IDSN Portal! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Git for version control
- Basic knowledge of TypeScript, React, and Next.js

### Setup Instructions
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `bun install`
4. Set up environment variables: `cp .env.example .env.local`
5. Run database setup: `bun run db:push`
6. Start development server: `bun run dev`

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### File Structure
- Place new components in appropriate `src/components/` subdirectories
- Add new API routes in `src/app/api/`
- Update database schema in `prisma/schema.prisma`
- Follow existing naming conventions

### Commit Messages
- Use conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat(auth): add two-factor authentication`
  - `fix(certification): resolve audit submission bug`
  - `docs(readme): update installation instructions`

## 🐛 Bug Reports

### Before Creating Issues
- Check existing issues for duplicates
- Ensure you're using the latest version
- Test in different browsers if applicable

### Creating Bug Reports
1. Use clear and descriptive titles
2. Provide detailed steps to reproduce
3. Include expected vs actual behavior
4. Add screenshots/screen recordings if helpful
5. Specify your environment (OS, browser, Node.js version)

## ✨ Feature Requests

### Proposing New Features
1. Check existing issues and discussions
2. Create a discussion for major features first
3. Provide clear use cases and benefits
4. Consider implementation complexity and impact

### Feature Request Template
```markdown
## Feature Description
Brief description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

## 🧪 Testing

### Running Tests
```bash
bun run test        # Run all tests
bun run test:watch  # Run tests in watch mode
bun run lint        # Run linting
bun run type-check  # Run TypeScript checking
```

### Writing Tests
- Test components with React Testing Library
- Test API endpoints with appropriate tools
- Aim for high code coverage
- Test edge cases and error scenarios

## 📝 Documentation

### Updating Documentation
- Keep README.md up to date
- Add inline comments for complex logic
- Update API documentation for new endpoints
- Include examples in documentation

### Documentation Structure
- `README.md`: Project overview and setup
- `docs/`: Detailed guides and API documentation
- Code comments: Complex logic explanations

## 🔄 Pull Request Process

### Before Submitting
1. Fork and clone the repository
2. Create a feature branch from `main`
3. Make your changes with proper commits
4. Test your changes thoroughly
5. Update documentation as needed

### Pull Request Guidelines
1. Use descriptive PR titles
2. Link to relevant issues
3. Include screenshots for UI changes
4. Add "Draft" label if work in progress
5. Request review from appropriate maintainers

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Changes are tested manually

## 🏷️ Issue Labels

- `bug`: Bug reports and fixes
- `enhancement`: Feature improvements
- `documentation`: Documentation updates
- `good first issue`: Suitable for new contributors
- `help wanted`: Community assistance needed
- `priority: high`: High priority issues
- `priority: medium`: Medium priority issues
- `priority: low`: Low priority issues

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Avoid personal attacks or criticism

### Getting Help
- Create discussions for questions
- Join our Discord community (link coming soon)
- Check existing issues and documentation
- Reach out to maintainers for guidance

## 🎯 Roadmap

### Current Priorities
1. Enhanced mobile experience
2. Advanced analytics dashboard
3. Integration with external LMS systems
4. Multi-language support
5. Advanced notification system

### Future Features
- AI-powered course recommendations
- Virtual classroom integration
- Advanced reporting tools
- Mobile applications
- API for third-party integrations

## 📞 Getting Help

### Resources
- [Project Documentation](docs/)
- [API Reference](docs/api/)
- [Component Library](docs/components/)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Contact
- Create an issue for bug reports
- Start a discussion for questions
- Email: support@idsn.portal

---

Thank you for contributing to IDSN Portal! Your help makes this project better for everyone. 🎉