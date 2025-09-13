.PHONY: dev build test test:e2e lint typecheck clean db:reset db:seed install

# Install dependencies
install:
	pnpm install

# Development
dev:
	pnpm turbo dev

# Build all packages
build:
	pnpm turbo build

# Run tests
test:
	pnpm turbo test

# Run e2e tests
test:e2e:
	pnpm turbo test:e2e

# Lint all packages
lint:
	pnpm turbo lint

# Type check all packages
typecheck:
	pnpm turbo typecheck

# Clean all build artifacts
clean:
	pnpm turbo clean

# Reset database
db:reset:
	pnpm turbo db:reset

# Seed database
db:seed:
	pnpm turbo db:seed

# Setup development environment
setup: install
	@echo "Setting up development environment..."
	@echo "Please configure your .env files in each app/package directory"
	@echo "Run 'make dev' to start development servers"
