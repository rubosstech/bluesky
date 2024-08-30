import React from 'react'
import {View} from 'react-native'
import {AppBskyActorDefs} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useQuery, useQueryClient} from '@tanstack/react-query'

import {getRootNavigation, getTabState, TabState} from '#/lib/routes/helpers'
import {logEvent} from '#/lib/statsig/statsig'
import {isNative} from '#/platform/detection'
import {listenSoftReset} from '#/state/events'
import {FeedFeedbackProvider, useFeedFeedback} from '#/state/feed-feedback'
import {STALE} from '#/state/queries'
import {RQKEY as FEED_RQKEY} from '#/state/queries/post-feed'
import {FeedDescriptor, FeedParams} from '#/state/queries/post-feed'
import {truncateAndInvalidate} from '#/state/queries/util'
import {useSession} from '#/state/session'
import {useSetMinimalShellMode} from '#/state/shell'
import {useComposerControls} from '#/state/shell/composer'
import {useAgent} from '#/state/verus_session'
import {useAnalytics} from 'lib/analytics/analytics'
import {ComposeIcon2} from 'lib/icons'
import {AllNavigatorParams} from 'lib/routes/types'
import {s} from 'lib/styles'
import {Text} from 'view/com/util/text/Text'
import {useHeaderOffset} from '#/components/hooks/useHeaderOffset'
import {Feed} from '../posts/Feed'
import {FAB} from '../util/fab/FAB'
import {ListMethods} from '../util/List'
import {LoadLatestBtn} from '../util/load-latest/LoadLatestBtn'
import {MainScrollProvider} from '../util/MainScrollProvider'

const POLL_FREQ = 60e3 // 60sec

export function FeedPage({
  testID,
  isPageFocused,
  feed,
  feedParams,
  renderEmptyState,
  renderEndOfFeed,
  savedFeedConfig,
}: {
  testID?: string
  feed: FeedDescriptor
  feedParams?: FeedParams
  isPageFocused: boolean
  renderEmptyState: () => JSX.Element
  renderEndOfFeed?: () => JSX.Element
  savedFeedConfig?: AppBskyActorDefs.SavedFeed
}) {
  const {hasSession} = useSession()
  const {_} = useLingui()
  const navigation = useNavigation<NavigationProp<AllNavigatorParams>>()
  const queryClient = useQueryClient()
  const {openComposer} = useComposerControls()
  const [isScrolledDown, setIsScrolledDown] = React.useState(false)
  const setMinimalShellMode = useSetMinimalShellMode()
  const {screen, track} = useAnalytics()
  const headerOffset = useHeaderOffset()
  const feedFeedback = useFeedFeedback(feed, hasSession)
  const scrollElRef = React.useRef<ListMethods>(null)
  const [hasNew, setHasNew] = React.useState(false)

  const scrollToTop = React.useCallback(() => {
    scrollElRef.current?.scrollToOffset({
      animated: isNative,
      offset: -headerOffset,
    })
    setMinimalShellMode(false)
  }, [headerOffset, setMinimalShellMode])

  const onSoftReset = React.useCallback(() => {
    const isScreenFocused =
      getTabState(getRootNavigation(navigation).getState(), 'Home') ===
      TabState.InsideAtRoot
    if (isScreenFocused && isPageFocused) {
      scrollToTop()
      truncateAndInvalidate(queryClient, FEED_RQKEY(feed))
      setHasNew(false)
      logEvent('feed:refresh:sampled', {
        feedType: feed.split('|')[0],
        feedUrl: feed,
        reason: 'soft-reset',
      })
    }
  }, [navigation, isPageFocused, scrollToTop, queryClient, feed, setHasNew])

  // fires when page within screen is activated/deactivated
  React.useEffect(() => {
    if (!isPageFocused) {
      return
    }
    screen('Feed')
    return listenSoftReset(onSoftReset)
  }, [onSoftReset, screen, isPageFocused])

  const onPressCompose = React.useCallback(() => {
    track('HomeScreen:PressCompose')
    openComposer({})
  }, [openComposer, track])

  const onPressLoadLatest = React.useCallback(() => {
    scrollToTop()
    truncateAndInvalidate(queryClient, FEED_RQKEY(feed))
    setHasNew(false)
    logEvent('feed:refresh:sampled', {
      feedType: feed.split('|')[0],
      feedUrl: feed,
      reason: 'load-latest',
    })
  }, [scrollToTop, feed, queryClient, setHasNew])

  const agent = useAgent()
  const markVerusPost = useQuery({
    staleTime: STALE.SECONDS.FIFTEEN,
    queryKey: ['singlePost', '1'],
    async queryFn() {
      const identity = 'Mbnv@'
      let resp = await agent.rpcInterface.getIdentity(identity)
      let contentmultimap = resp.result?.identity.contentmultimap

      if (contentmultimap === undefined) {
        return contentmultimap
      }

      // This is simple parsing now. It may need a recursive structure for
      // handling the map values in map values.
      // Check if the multimap is an array of values.
      if (Array.isArray(contentmultimap)) {
        return contentmultimap
      } else {
        // This is the i-address of vrsc::identity.post
        let postKey = 'iPwPUbWTh5hFG4fpnAymPz4t2b74263ukZ'
        let postContent = contentmultimap[postKey]
        // Check if there are several values for that post.
        if (Array.isArray(postContent)) {
          // Decode the string from hex to regular text.
          return Buffer.from(postContent[0], 'hex').toString('binary')
        } else {
          return postContent
        }
      }
    },
  })
  const mark2VerusPost = useQuery({
    staleTime: STALE.SECONDS.FIFTEEN,
    queryKey: ['singlePost', '2'],
    async queryFn() {
      const identity = 'MJS@'
      let resp = await agent.rpcInterface.getIdentity(identity)
      let contentmultimap = resp.result?.identity.contentmultimap

      if (contentmultimap === undefined) {
        return contentmultimap
      }

      // This is simple parsing now. It may need a recursive structure for
      // handling the map values in map values.
      // Check if the multimap is an array of values.
      if (Array.isArray(contentmultimap)) {
        return contentmultimap
      } else {
        // This is the i-address of vrsc::identity.post
        let postKey = 'iPwPUbWTh5hFG4fpnAymPz4t2b74263ukZ'
        let postContent = contentmultimap[postKey]
        // Check if there are several values for that post.
        if (Array.isArray(postContent)) {
          // Decode the string from hex to regular text.
          return Buffer.from(postContent[0], 'hex').toString('binary')
        } else {
          return postContent
        }
      }
    },
  })

  return (
    <View testID={testID} style={s.h100pct}>
      <MainScrollProvider>
        <FeedFeedbackProvider value={feedFeedback}>
          <View
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 2,
              marginHorizontal: 'auto',
              paddingTop: headerOffset + 8,
            }}>
            <Text>
              <Text style={{fontSize: 16, fontWeight: 700, marginRight: 4}}>
                Mark Verus
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 0.25,
                  color: 'rgb(66, 87, 108)',
                }}>
                Mbnv@
              </Text>
            </Text>
            <Text>{JSON.stringify(markVerusPost.data)}</Text>
          </View>
          <View
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 2,
              marginHorizontal: 'auto',
            }}>
            <Text>
              <Text style={{fontSize: 16, fontWeight: 700, marginRight: 4}}>
                Mark 2 Verus
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 0.25,
                  color: 'rgb(66, 87, 108)',
                }}>
                MJS@
              </Text>
            </Text>
            <Text>{JSON.stringify(mark2VerusPost.data)}</Text>
          </View>
          <Feed
            testID={testID ? `${testID}-feed` : undefined}
            enabled={isPageFocused}
            feed={feed}
            feedParams={feedParams}
            pollInterval={POLL_FREQ}
            disablePoll={hasNew}
            scrollElRef={scrollElRef}
            onScrolledDownChange={setIsScrolledDown}
            onHasNew={setHasNew}
            renderEmptyState={renderEmptyState}
            renderEndOfFeed={renderEndOfFeed}
            headerOffset={headerOffset}
            savedFeedConfig={savedFeedConfig}
          />
        </FeedFeedbackProvider>
      </MainScrollProvider>
      {(isScrolledDown || hasNew) && (
        <LoadLatestBtn
          onPress={onPressLoadLatest}
          label={_(msg`Load new posts`)}
          showIndicator={hasNew}
        />
      )}

      {hasSession && (
        <FAB
          testID="composeFAB"
          onPress={onPressCompose}
          icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
          accessibilityRole="button"
          accessibilityLabel={_(msg({message: `New post`, context: 'action'}))}
          accessibilityHint=""
        />
      )}
    </View>
  )
}
