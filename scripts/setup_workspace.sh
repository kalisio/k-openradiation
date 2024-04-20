#!/usr/bin/env bash
set -euo pipefail
# set -x

THIS_FILE=$(readlink -f "${BASH_SOURCE[0]}")
THIS_DIR=$(dirname "$THIS_FILE")
ROOT_DIR=$(dirname "$THIS_DIR")

. "$THIS_DIR/kash/kash.sh"

begin_group "Setting up openradiation ..."

if [ "$CI" = true ]; then
    openradiation_DIR="$(dirname "$ROOT_DIR")"
    DEVELOPMENT_REPO_URL="https://$GITHUB_DEVELOPMENT_PAT@github.com/kalisio/development.git"
else
    while getopts "b:t" option; do
        case $option in
            b) # defines branch
                openradiation_BRANCH=$OPTARG;;
            t) # defines tag
                openradiation_TAG=$OPTARG;;
            *)
            ;;
        esac
    done

    shift $((OPTIND-1))
    openradiation_DIR="$1"
    DEVELOPMENT_REPO_URL="$GITHUB_URL/kalisio/development.git"

    # Clone project in the openradiation
    git_shallow_clone "$GITHUB_URL/kalisio/k-centipede.git" "$openradiation_DIR/k-centipede" "${openradiation_TAG:-${openradiation_BRANCH:-}}"
fi

setup_job_openradiation "$openradiation_DIR" "$DEVELOPMENT_REPO_URL"

end_group "Setting up openradiation ..."