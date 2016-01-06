#
#   DIST.sh
#
#   David Janes
#   IOTDB
#   2016-01-06
#

exit 0
PACKAGE=homestar-test
DIST_ROOT=/var/tmp/.dist.$$

if [ ! -d "$DIST_ROOT" ]
then
    mkdir "$DIST_ROOT"
fi

echo "=================="
echo "NPM Packge: $PACKAGE"
echo "=================="
(
    NPM_DST="$DIST_ROOT/$PACKAGE"
    echo "NPM_DST=$NPM_DST"

    if [ -d ${NPM_DST} ]
    then
        rm -rf "${NPM_DST}"
    fi
    mkdir "${NPM_DST}" || exit 1

    update-package --increment-version --package "$PACKAGE" --homestar || exit 1

    tar cf - \
        --exclude "node_modules" \
        README.md LICENSE \
        homestar.json package.json \
        TestBridge.js index.js \
        models/*.js models/*.json \
        |
    ( cd "${NPM_DST}" && tar xvf - && npm publish ) || exit 1
    git commit -m "new release" package.json || exit 1
    git push || exit 1

    echo "end"
)
