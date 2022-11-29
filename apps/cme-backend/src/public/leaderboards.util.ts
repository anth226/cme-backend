export enum LeaderBoardType {
  ECONOMIC_LEADERS = 'economicLeaders',
  SCIENTIST_LEADERS = 'scientistLeaders',
  WARLIKE_LEADERS = 'warlikeLeaders',
  STEALER_LEADERS = 'stealerLeaders',
}

export const LEADERS_QUERIES = {
  [LeaderBoardType.ECONOMIC_LEADERS]:
    ' SELECT v.name, vr.total, RANK () OVER ( \
                                            ORDER BY vr.total DESC \
                                                ) rank  FROM villages v \
                                                LEFT JOIN \
                                                    (SELECT village_id, SUM(count) as total FROM villages_resource_types GROUP BY village_id) vr \
                                                ON v.id = vr.village_id \
                                                LIMIT ${limit}',
  [LeaderBoardType.SCIENTIST_LEADERS]:
    'SELECT village_id, sum(level) as tech_level, name, username \
                                            FROM facilities \
                                                left join users \
                                                left join villages \
                                                on villages.user_id = users.id \
                                                on village_id = villages.id \
                                                group by village_id, villages.name, users.username \
                                                order by tech_level desc \
                                                LIMIT ${limit}',
  [LeaderBoardType.WARLIKE_LEADERS]:
    'SELECT users.username, count(*) as count_attack \
                                            FROM attacks \
                                            LEFT JOIN users on users.id = attacker_id \
                                            ${whereClause} \
                                                group by users.username \
                                                order by count_attack desc \
                                            LIMIT ${limit}',
  [LeaderBoardType.STEALER_LEADERS]:
    "  select count(*) as stolen_volume, attacker_id, username \
                                            from (select json_array_elements(resources_stolen)->'count' as stolen_resources, attacker_id \
                                            from (select stolen_resources->'resources' as resources_stolen, attacker_id from attacks where stolen_resources is not NULL) \
                                                as x) \
                                                as y \
                                                    left join users on users.id = attacker_id \
                                            ${whereClause} \
                                            group by attacker_id, username order by stolen_volume desc \
                                            LIMIT ${limit}",
};
