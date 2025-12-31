-- ==========================================
-- Insert 60-question PSA survey (50 forward + 10 reverse)
-- Migration: 010_insert_60_questions
-- ==========================================

-- Forward questions 1-50 (from 006_update_survey_to_50_questions.sql)

-- Innovation & Vision (혁신 사고) - Questions 1-10
INSERT INTO survey_questions (question_number, category, question_text, question_hint, version, is_reverse_scored) VALUES
(1, 'innovation', '나는 기존의 방식보다 완전히 새로운 접근법을 제안하는 것을 즐긴다', '새로운 접근법 선호도', 2, false),
(2, 'innovation', '복잡하고 추상적인 개념을 논리적으로 구조화하여 시각화하는 데 능숙하다', '구조화 및 시각화 능력', 2, false),
(3, 'innovation', '업무와 직접 관련이 없더라도 새로운 기술이나 트렌드를 탐색하는 데 시간을 쓴다', '새로운 기술 탐색', 2, false),
(4, 'innovation', '"원래 그렇게 해왔다"는 관습적인 방식에 강한 거부감을 느낀다', '관습에 대한 태도', 2, false),
(5, 'innovation', '나는 당장의 성과보다 3~5년 뒤의 미래 비전을 그리는 일을 선호한다', '장기 비전 vs 단기 성과', 2, false),
(6, 'innovation', '정해진 매뉴얼이 없는 모호한 상황에서 새로운 길을 만드는 것이 설렌다', '불확실성에 대한 태도', 2, false),
(7, 'innovation', '데이터 사이에서 남들이 보지 못하는 패턴이나 인사이트를 읽어내는 능력이 있다', '패턴 인식 능력', 2, false),
(8, 'innovation', '나는 아이디어를 낼 때 현실적인 제약 사항은 잠시 접어두고 상상한다', '자유로운 발상', 2, false),
(9, 'innovation', '지적인 자극을 주는 사람들과 토론하며 아이디어를 확장할 때 에너지를 얻는다', '지적 교류 선호', 2, false),
(10, 'innovation', '변화하는 시장 상황을 예측하고 남들보다 선제적으로 대응하는 것을 즐긴다', '시장 예측 능력', 2, false),

-- Execution & Discipline (철저 실행) - Questions 11-20
(11, 'execution', '나는 업무를 시작하기 전, 실행 단계가 포함된 정교한 체크리스트부터 작성한다', '계획 수립 습관', 2, false),
(12, 'execution', '마감 기한을 지키는 것은 나의 프로페셔널리즘을 증명하는 가장 중요한 척도다', '시간 엄수 중요도', 2, false),
(13, 'execution', '아주 사소한 오타나 숫자의 오류도 끝까지 찾아내어 수정하는 편이다', '디테일 민감도', 2, false),
(14, 'execution', '나는 매일 반복되는 루틴을 유지하며 성과를 쌓아가는 것에 능숙하다', '루틴 유지 능력', 2, false),
(15, 'execution', '화려한 아이디어보다는 실제로 작동하는 결과물을 내놓는 것이 더 가치 있다고 믿는다', '아이디어 vs 결과', 2, false),
(16, 'execution', '일을 할 때 우선순위를 명확히 정하고, 가장 임팩트 있는 일에만 집중한다', '우선순위 관리', 2, false),
(17, 'execution', '프로젝트의 진행 상황을 문서화하여 팀에 공유하는 과정을 철저히 지킨다', '문서화 습관', 2, false),
(18, 'execution', '자원(예산, 인력, 시간)을 효율적으로 배치하여 낭비를 최소화하는 능력이 탁월하다', '자원 관리 능력', 2, false),
(19, 'execution', '나는 감정에 휘둘리지 않고 객관적인 데이터와 근거를 바탕으로 의사결정한다', '데이터 기반 의사결정', 2, false),
(20, 'execution', '복잡하고 큰 과업을 실행 가능한 작은 단위(Action Item)로 쪼개는 데 능숙하다', '업무 분해 능력', 2, false),

-- Influence & Impact (대인 영향) - Questions 21-30
(21, 'influence', '나는 내 아이디어를 사람들에게 발표하고 설득하여 동의를 얻는 과정이 즐겁다', '설득 과정 선호', 2, false),
(22, 'influence', '처음 만난 비즈니스 파트너와도 대화를 주도하며 관계를 형성하는 데 어려움이 없다', '초면 대화 능력', 2, false),
(23, 'influence', '회의나 미팅에서 논의가 정체될 때, 결론을 이끌어내는 퍼실리테이터 역할을 자처한다', '퍼실리테이터 역할', 2, false),
(24, 'influence', 'SNS나 외부 커뮤니티에 나의 전문적인 견해나 성과를 기록하고 알리는 편이다', '온라인 활동', 2, false),
(25, 'influence', '나는 논리적인 분석뿐만 아니라 사람의 마음을 움직이는 스토리텔링의 힘을 활용한다', '스토리텔링 활용', 2, false),
(26, 'influence', '의사결정권자의 의도를 빠르게 파악하여 그들이 원하는 핵심 포인트를 제안한다', '의사결정자 설득', 2, false),
(27, 'influence', '나는 그룹 내에서 리더나 대변인 역할을 맡아 영향력을 발휘하는 경우가 많다', '리더 역할 빈도', 2, false),
(28, 'influence', '나만의 독특한 스타일이나 매력으로 사람들의 시선을 끌고 신뢰를 주는 편이다', '개성 표현', 2, false),
(29, 'influence', '협상 상황에서 내가 원하는 조건을 관철시키기 위해 끈기 있게 설득한다', '협상 능력', 2, false),
(30, 'influence', '사람과 사람을 연결하여 새로운 비즈니스 기회나 시너지를 창출하는 것을 즐긴다', '연결자 역할', 2, false),

-- Collaboration & Synergy (협업 공감) - Questions 31-40
(31, 'collaboration', '나는 개인의 화려한 성과보다 팀 전체의 조화로운 목표 달성에서 더 큰 보람을 느낀다', '팀 vs 개인 성과', 2, false),
(32, 'collaboration', '상대방의 의견이 나와 다르더라도 끝까지 경청하고 그 맥락을 이해하려 노력한다', '경청 태도', 2, false),
(33, 'collaboration', '동료의 강점과 잠재력을 발견하여 구체적으로 칭찬하거나 성장을 돕는 일을 잘한다', '타인 강점 발견', 2, false),
(34, 'collaboration', '갈등 상황이 발생했을 때, 옳고 그름을 따지기보다 화해와 합의의 지점을 찾는다', '갈등 해결 방식', 2, false),
(35, 'collaboration', '나는 팀원 개개인의 성향과 특성에 맞춰 소통 방식(커뮤니케이션 톤)을 조절한다', '개별 맞춤 소통', 2, false),
(36, 'collaboration', '내가 가진 노하우나 정보를 독점하지 않고 팀의 성장을 위해 투명하게 공유한다', '정보 공유 태도', 2, false),
(37, 'collaboration', '결과물만큼이나 함께 일하는 동료들이 느끼는 "과정의 만족도"를 중요하게 여긴다', '과정 vs 결과', 2, false),
(38, 'collaboration', '조직 내 권위적인 태도보다는 수평적이고 민주적인 의사결정 방식을 지향한다', '소통 스타일', 2, false),
(39, 'collaboration', '나는 혼자 일할 때보다 다양한 전문가와 협업할 때 훨씬 더 좋은 결과물을 낸다', '협업 선호', 2, false),
(40, 'collaboration', '구성원들이 심리적으로 안전하게 의견을 낼 수 있는 환경을 만드는 데 기여한다', '심리적 안전 중요도', 2, false),

-- Resilience & Adaptability (상황 회복) - Questions 41-50
(41, 'resilience', '예상치 못한 큰 실수를 하더라도 빠르게 평정심을 되찾고 수습에 집중한다', '실수 후 회복', 2, false),
(42, 'resilience', '나는 업무 압박이나 마감이 임박한 스트레스 상황에서 오히려 집중력이 높아진다', '압박 상황 대처', 2, false),
(43, 'resilience', '날카롭거나 비판적인 피드백을 들어도 감정적으로 동요하지 않고 성장의 발판으로 삼는다', '비판 대처', 2, false),
(44, 'resilience', '계획이 완전히 무산되었을 때 당황하지 않고 즉시 가동할 수 있는 "플랜 B"를 찾는다', '대안 준비', 2, false),
(45, 'resilience', '나는 과거의 실패를 후회하기보다, 거기서 얻은 교훈을 다음 프로젝트에 바로 적용한다', '미래 지향성', 2, false),
(46, 'resilience', '불확실한 미래를 걱정하기보다, 현재 내가 통제할 수 있는 일에 에너지를 쏟는다', '현재 집중력', 2, false),
(47, 'resilience', '어떤 어려운 상황에서도 "결국 해결책은 있다"는 긍정적이고 낙관적인 태도를 유지한다', '낙관성', 2, false),
(48, 'resilience', '리스크가 있는 결정이라도 반드시 필요하다면 과감하게 선택하고 결과를 책임진다', '리스크 감수', 2, false),
(49, 'resilience', '변화무쌍한 환경이나 낯선 조직 문화에 던져졌을 때 남들보다 빠르게 적응한다', '환경 적응력', 2, false),
(50, 'resilience', '어떤 시련이나 변화 속에서도 내 삶과 커리어의 주도권은 나에게 있다는 확신이 있다', '주도권 확신', 2, false),

-- Reverse-scored questions 51-60
-- Innovation reverse (51-52)
(51, 'innovation', '새로운 것을 시도하기보다 이미 검증된 안정적인 방식을 유지하는 것이 조직에 더 이롭다고 생각한다', NULL, 2, true),
(52, 'innovation', '현실적인 데이터나 근거가 부족한 아이디어는 아무리 신선해도 신뢰하지 않는 편이다', NULL, 2, true),

-- Execution reverse (53-54)
(53, 'execution', '계획에 없던 돌발 상황이 생기면 효율이 급격히 떨어지거나 스트레스를 많이 받는다', NULL, 2, true),
(54, 'execution', '가끔은 완벽한 결과물을 내는 것보다, 적당한 수준에서 빠르게 일을 마무리하는 것이 더 중요하다고 느낀다', NULL, 2, true),

-- Influence reverse (55-56)
(55, 'influence', '내 성과를 남들에게 알리거나 설득하는 일보다, 묵묵히 내 할 일을 완수하는 것에서 더 큰 만족을 느낀다', NULL, 2, true),
(56, 'influence', '회의나 대화에서 주도적으로 의견을 내기보다, 주로 타인의 의견을 경청하고 관찰하는 편이다', NULL, 2, true),

-- Collaboration reverse (57-58)
(57, 'collaboration', '팀의 분위기가 조금 어색해지더라도, 목표 달성을 위해 동료의 잘못을 냉정하게 지적해야 한다고 믿는다', NULL, 2, true),
(58, 'collaboration', '다른 사람들과 함께 협업할 때보다, 혼자 집중해서 일할 때 업무 효율이 훨씬 높다', NULL, 2, true),

-- Resilience reverse (59-60)
(59, 'resilience', '예상치 못한 실패를 겪으면 그 여파가 오래가며, 스스로를 자책하는 시간을 길게 갖는 편이다', NULL, 2, true),
(60, 'resilience', '잠재적인 리스크에 대해 남들보다 더 민감하게 반응하며, 최악의 시나리오를 대비하느라 시작이 늦어지곤 한다', NULL, 2, true);

-- Verification queries
SELECT category, is_reverse_scored, COUNT(*) as count
FROM survey_questions
WHERE version = 2 AND is_active = true
GROUP BY category, is_reverse_scored
ORDER BY category, is_reverse_scored;

-- Should show:
-- collaboration | false | 10
-- collaboration | true  | 2
-- execution     | false | 10
-- execution     | true  | 2
-- influence     | false | 10
-- influence     | true  | 2
-- innovation    | false | 10
-- innovation    | true  | 2
-- resilience    | false | 10
-- resilience    | true  | 2

SELECT COUNT(*) as total FROM survey_questions WHERE version = 2 AND is_active = true;
-- Should return: 60
