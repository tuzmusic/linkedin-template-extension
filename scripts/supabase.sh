#!/bin/bash

# TODO: this if statement is returning truthy even when docker is already runningÅ

#if ! docker info > /dev/null 2>&1; then
#  echo -e "\nDocker daemon must be running to start Supabase. Run:\n$ open -a Docker\n\nand try again"
#  exit 1
#fi

trap 'npx supabase stop' EXIT
npx supabase start && npx supabase functions serve
