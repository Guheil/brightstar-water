'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronDown, CircleHelp, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  FAQ_CATEGORIES,
  getFaqItemsForContext,
  searchFaqItems,
} from '@/config/faq';
import type { FaqCategoryId } from '@/types/faq';
import {
  AnswerDetails,
  AnswerText,
  CategoryButton,
  CategoryNav,
  CloseButton,
  Controls,
  EmptyState,
  EmptyText,
  EmptyTitle,
  FloatingHelpButton,
  HeaderCopy,
  HelpBody,
  HelpDialog,
  Panel,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  QuestionAccordion,
  QuestionGroup,
  QuestionList,
  QuestionSummary,
  QuestionText,
  QuestionsScroll,
  ResultSummary,
  ResultsHeader,
  ResultsTitle,
  SearchField,
} from './elements';
import type {
  HelpCategoryOption,
  HelpCenterProps,
  HelpCenterTone,
  QuestionGroupContentProps,
} from './interface';

const RECOMMENDED_QUESTION_COUNT = 4;

const categoryOptions: readonly HelpCategoryOption[] = [
  { id: 'all', label: 'All' },
  ...FAQ_CATEGORIES,
];

function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

function QuestionGroupContent({
  items,
  expandedId,
  onExpandedChange,
}: QuestionGroupContentProps) {
  return (
    <QuestionList>
      {items.map((item) => {
        const expanded = expandedId === item.id;
        const headingId = `${item.id}-question`;
        const contentId = `${item.id}-answer`;

        return (
          <QuestionAccordion
            disableGutters
            expanded={expanded}
            key={item.id}
            onChange={(_event, nextExpanded) =>
              onExpandedChange(nextExpanded ? item.id : false)
            }
          >
            <QuestionSummary
              aria-controls={contentId}
              expandIcon={<ChevronDown aria-hidden="true" />}
              id={headingId}
            >
              <QuestionText>{item.question}</QuestionText>
            </QuestionSummary>
            <AnswerDetails aria-labelledby={headingId} id={contentId}>
              <AnswerText>{item.answer}</AnswerText>
            </AnswerDetails>
          </QuestionAccordion>
        );
      })}
    </QuestionList>
  );
}

export default function HelpCenter({ brandKey = null }: HelpCenterProps) {
  const pathname = usePathname();
  const questionsScrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | FaqCategoryId>('all');
  const [expandedId, setExpandedId] = useState<string | false>(false);

  const tone: HelpCenterTone =
    brandKey === 'mrje' ? 'gas' : brandKey === 'brightstar' ? 'water' : 'neutral';

  const contextualItems = useMemo(
    () => getFaqItemsForContext({ pathname, brandKey }),
    [brandKey, pathname],
  );

  const visibleItems = useMemo(() => {
    const searched = searchFaqItems(contextualItems, query);
    if (query.trim()) return searched;
    if (category === 'all') return searched;
    return searched.filter((item) => item.category === category);
  }, [category, contextualItems, query]);

  const availableCategories = useMemo(() => {
    const categoryIds = new Set(contextualItems.map((item) => item.category));
    return categoryOptions.filter(
      (option) => option.id === 'all' || categoryIds.has(option.id),
    );
  }, [contextualItems]);

  const recommendedItems = useMemo(
    () => contextualItems.slice(0, RECOMMENDED_QUESTION_COUNT),
    [contextualItems],
  );

  const browseItems = useMemo(() => {
    const recommendedIds = new Set(recommendedItems.map((item) => item.id));
    return contextualItems.filter((item) => !recommendedIds.has(item.id));
  }, [contextualItems, recommendedItems]);

  const showContextGroups = !query.trim() && category === 'all';

  const resetQuestionScroll = () => {
    if (questionsScrollRef.current) questionsScrollRef.current.scrollTop = 0;
  };

  const closePanel = () => setOpen(false);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setExpandedId(false);
    resetQuestionScroll();
  };

  const handleCategoryChange = (nextCategory: 'all' | FaqCategoryId) => {
    setQuery('');
    setCategory(nextCategory);
    setExpandedId(false);
    resetQuestionScroll();
  };

  return (
    <>
      <FloatingHelpButton
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open help"
        onClick={() => setOpen(true)}
        $tone={tone}
      >
        <CircleHelp aria-hidden="true" />
        Help
      </FloatingHelpButton>

      <HelpDialog
        aria-describedby="customer-help-description"
        aria-labelledby="customer-help-title"
        maxWidth={false}
        onClose={closePanel}
        open={open}
        scroll="paper"
      >
        <Panel>
          <PanelHeader>
            <HeaderCopy>
              <PanelTitle id="customer-help-title">Help</PanelTitle>
              <PanelDescription id="customer-help-description">
                Find quick answers about ordering, delivery, payments, and your account.
              </PanelDescription>
            </HeaderCopy>
            <CloseButton aria-label="Close help" onClick={closePanel}>
              <X aria-hidden="true" />
            </CloseButton>
          </PanelHeader>

          <Controls>
            <SearchField
              autoComplete="off"
              label="Search questions"
              onChange={(event) => handleQueryChange(event.target.value)}
              type="search"
              value={query}
            />
          </Controls>

          <HelpBody>
            <CategoryNav aria-label="FAQ categories">
              {availableCategories.map((option) => (
                <CategoryButton
                  aria-pressed={category === option.id && !query.trim()}
                  key={option.id}
                  onClick={() => handleCategoryChange(option.id)}
                  $active={category === option.id && !query.trim()}
                  $tone={tone}
                >
                  {option.label}
                </CategoryButton>
              ))}
            </CategoryNav>

            <QuestionsScroll
              aria-label="Help questions"
              data-lenis-prevent=""
              ref={questionsScrollRef}
              role="region"
            >
              {showContextGroups ? (
                <>
                  <QuestionGroup aria-labelledby="recommended-help-questions">
                    <ResultsHeader>
                      <ResultsTitle id="recommended-help-questions">
                        Recommended for this page
                      </ResultsTitle>
                      <ResultSummary>
                        {questionCountLabel(recommendedItems.length)}
                      </ResultSummary>
                    </ResultsHeader>
                    <QuestionGroupContent
                      expandedId={expandedId}
                      items={recommendedItems}
                      onExpandedChange={setExpandedId}
                    />
                  </QuestionGroup>

                  {browseItems.length ? (
                    <QuestionGroup aria-labelledby="browse-help-questions">
                      <ResultsHeader>
                        <ResultsTitle id="browse-help-questions">
                          Browse all questions
                        </ResultsTitle>
                        <ResultSummary>
                          {questionCountLabel(browseItems.length)}
                        </ResultSummary>
                      </ResultsHeader>
                      <QuestionGroupContent
                        expandedId={expandedId}
                        items={browseItems}
                        onExpandedChange={setExpandedId}
                      />
                    </QuestionGroup>
                  ) : null}
                </>
              ) : visibleItems.length ? (
                <QuestionGroup aria-labelledby="filtered-help-questions">
                  <ResultsHeader>
                    <ResultsTitle id="filtered-help-questions">
                      {query.trim()
                        ? 'Search results'
                        : availableCategories.find((option) => option.id === category)?.label ?? 'Questions'}
                    </ResultsTitle>
                    <ResultSummary>
                      {questionCountLabel(visibleItems.length)}
                    </ResultSummary>
                  </ResultsHeader>
                  <QuestionGroupContent
                    expandedId={expandedId}
                    items={visibleItems}
                    onExpandedChange={setExpandedId}
                  />
                </QuestionGroup>
              ) : (
                <EmptyState role="status">
                  <EmptyTitle>No matching questions</EmptyTitle>
                  <EmptyText>
                    Try a shorter search or choose another category.
                  </EmptyText>
                </EmptyState>
              )}
            </QuestionsScroll>
          </HelpBody>
        </Panel>
      </HelpDialog>
    </>
  );
}
