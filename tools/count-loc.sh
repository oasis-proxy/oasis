#!/bin/bash

# oasis - LoC Statistics Tool
# Counts lines of code in the src directory, grouped by file extension and directory.

echo "========================================"
echo " Oasis Project - LoC Statistics "
echo "========================================"
echo "Directory: src/"
echo "Date: $(date)"
echo "----------------------------------------"

# Summary by extension
echo "LoC by File Type:"
find src -type f \( -name "*.vue" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.html" \) -exec wc -l {} + | awk '{
    ext = $2; sub(/.*\./, "", ext);
    lines[ext] += $1;
    files[ext]++;
    total_lines += $1;
} END {
    for (e in lines) {
        printf "  %-6s: %8d lines in %d files\n", e, lines[e], files[e]
    }
    printf "  --------------------------------\n"
    printf "  TOTAL : %8d lines\n", total_lines
}'

echo ""
echo "LoC for Individual Files:"
find src -type f \( -name "*.vue" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.html" \) -exec wc -l {} + | sort -rn | awk '
$2 != "total" {
    printf "  %8d lines : %s\n", $1, $2
}'

echo "========================================"
