# Fallback Assets

This directory contains simplified fallback assets used when primary assets fail to load.

## Contents

- `player.png`: Basic player character placeholder (32x32)
- `enemy.png`: Basic enemy character placeholder (32x32)
- `action-icons.png`: Simplified action icons
- `action-icons.json`: Atlas configuration for simplified icons

These assets are minimal in size and complexity to ensure they load quickly when needed.

## Usage

Fallback assets are automatically loaded by the AssetManager when primary assets fail to load.
They are designed to be:
- Small in file size
- Simple in design
- Quick to load
- Sufficient for basic gameplay

## Guidelines

When creating fallback assets:
1. Keep file sizes under 10KB
2. Use simple shapes and solid colors
3. Maintain consistent dimensions with primary assets
4. Include all necessary visual information
5. Test that they work in isolation 